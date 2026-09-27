using System.Collections.Generic;
using UnityEngine;

namespace BillShaderLab
{
    // Feeds the shape of Bill/Dissolve every frame, so the range and the sphere follow the
    // object instead of being numbers typed into the material.
    //  Direction   _DissolveRange = extent of the mesh along the direction
    //  Sphere      _SphereCenter from a transform (or the mesh center), _SphereRadius
    //              = distance to the farthest point of the mesh
    //  Pull        _PullTarget = the sphere center
    //
    // Bounding boxes overestimate both (a box around a character with open arms is mostly
    // air), which leaves a stretch of the Amount slider where nothing is left to dissolve.
    // So the fit uses a few hundred points sampled from the mesh itself, stored in this
    // object's local space once and moved with it every frame.
    [ExecuteAlways]
    public class DissolveShape : MonoBehaviour
    {
        public Vector3 direction = Vector3.up;
        public Transform sphereCenter;
        [Range(64, 2048)] public int samplePoints = 512;

        static readonly int DirectionId = Shader.PropertyToID("_DissolveDirection");
        static readonly int RangeId = Shader.PropertyToID("_DissolveRange");
        static readonly int CenterId = Shader.PropertyToID("_SphereCenter");
        static readonly int RadiusId = Shader.PropertyToID("_SphereRadius");
        static readonly int PullTargetId = Shader.PropertyToID("_PullTarget");

        Renderer[] renderers;
        MaterialPropertyBlock block;
        Vector3[] localPoints;

        void OnEnable()
        {
            renderers = GetComponentsInChildren<Renderer>();
            block = new MaterialPropertyBlock();
            Refit();
        }

        // Call again if the mesh or the pose changes a lot (the rest pose is enough for idles).
        public void Refit()
        {
            var points = new List<Vector3>();
            var baked = new Mesh();
            foreach (var r in renderers)
            {
                Vector3[] vertices;
                Matrix4x4 toWorld;
                if (r is SkinnedMeshRenderer skinned)
                {
                    skinned.BakeMesh(baked, true);
                    vertices = baked.vertices;
                    toWorld = Matrix4x4.TRS(r.transform.position, r.transform.rotation, Vector3.one);
                }
                else if (r.TryGetComponent<MeshFilter>(out var filter) && filter.sharedMesh != null)
                {
                    vertices = filter.sharedMesh.vertices;
                    toWorld = r.transform.localToWorldMatrix;
                }
                else continue;

                int stride = Mathf.Max(1, vertices.Length / Mathf.Max(1, samplePoints / renderers.Length));
                for (int i = 0; i < vertices.Length; i += stride)
                    points.Add(transform.InverseTransformPoint(toWorld.MultiplyPoint3x4(vertices[i])));
            }
            if (Application.isPlaying) Destroy(baked); else DestroyImmediate(baked);
            localPoints = points.ToArray();
        }

        void LateUpdate()
        {
            if (localPoints == null || localPoints.Length == 0) return;

            Vector3 dir = direction.sqrMagnitude > 0f ? direction.normalized : Vector3.up;
            float min = float.MaxValue, max = float.MinValue;
            Vector3 sum = Vector3.zero;
            var world = new Vector3[localPoints.Length];
            for (int i = 0; i < localPoints.Length; i++)
            {
                world[i] = transform.TransformPoint(localPoints[i]);
                float along = Vector3.Dot(world[i], dir);
                min = Mathf.Min(min, along);
                max = Mathf.Max(max, along);
                sum += world[i];
            }

            Vector3 center = sphereCenter != null ? sphereCenter.position : sum / world.Length;
            float radius = 0f;
            foreach (var p in world) radius = Mathf.Max(radius, Vector3.Distance(center, p));

            foreach (var r in renderers)
            {
                r.GetPropertyBlock(block);
                block.SetVector(DirectionId, dir);
                block.SetVector(RangeId, new Vector4(min, max, 0f, 0f));
                block.SetVector(CenterId, center);
                block.SetFloat(RadiusId, radius);
                // Pull drags vertices into the sphere center: the side closest to the
                // target dissolves first and flies in first.
                block.SetVector(PullTargetId, center);
                r.SetPropertyBlock(block);
            }
        }
    }
}
