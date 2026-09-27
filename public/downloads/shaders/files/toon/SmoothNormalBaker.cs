using System.Collections.Generic;
using UnityEditor;
using UnityEngine;

// Bakes one averaged normal per vertex position into UV3 for every imported model,
// so the Bill/Toon outline pass can extrude a closed hull even on hard-edged meshes.
// Put this file in any Editor folder, then reimport your models.
public class SmoothNormalBaker : AssetPostprocessor
{
    void OnPostprocessModel(GameObject root)
    {
        foreach (var filter in root.GetComponentsInChildren<MeshFilter>())
            Bake(filter.sharedMesh);
        foreach (var skinned in root.GetComponentsInChildren<SkinnedMeshRenderer>())
            Bake(skinned.sharedMesh);
    }

    public static void Bake(Mesh mesh)
    {
        if (mesh == null) return;
        var vertices = mesh.vertices;
        var normals = mesh.normals;
        if (normals == null || normals.Length != vertices.Length) return;

        // Vertices that share a position but not a normal are the seams of a hard edge.
        var sums = new Dictionary<Vector3Int, Vector3>();
        Vector3Int Key(Vector3 v) => Vector3Int.RoundToInt(v * 10000f);
        for (int i = 0; i < vertices.Length; i++)
        {
            sums.TryGetValue(Key(vertices[i]), out var sum);
            sums[Key(vertices[i])] = sum + normals[i];
        }

        var smooth = new Vector3[vertices.Length];
        for (int i = 0; i < vertices.Length; i++)
            smooth[i] = sums[Key(vertices[i])].normalized;
        mesh.SetUVs(3, smooth);
    }
}
