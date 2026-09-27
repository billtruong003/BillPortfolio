using System.Collections.Generic;
using UnityEngine;

namespace BillShaderLab
{
    // One shape of the scene-wide transition mask (materials with Shape = Global).
    //  Sphere   center = this position, radius
    //  Box      center = this position, half size = lossyScale / 2 (axis aligned), radius rounds corners
    //  Capsule  from this position to capsuleEnd, radius. stopShortOfEnd pulls the end back by the
    //           radius, so a capsule aimed at a character never reaches past it: the see-through
    //           hole must cut walls in front of the character, not the one behind it.
    [ExecuteAlways]
    public class TransitionShape : MonoBehaviour
    {
        public enum Kind { Sphere, Box, Capsule }

        public Kind kind = Kind.Sphere;
        public float radius = 1f;
        public Transform capsuleEnd;
        public bool stopShortOfEnd = true;

        internal static readonly List<TransitionShape> Active = new List<TransitionShape>();

        void OnEnable() => Active.Add(this);
        void OnDisable() => Active.Remove(this);

        internal void Encode(out Vector4 a, out Vector4 b)
        {
            Vector3 p = transform.position;
            switch (kind)
            {
                case Kind.Box:
                    a = new Vector4(p.x, p.y, p.z, 1f);
                    Vector3 half = transform.lossyScale * 0.5f;
                    b = new Vector4(half.x, half.y, half.z, radius);
                    break;
                case Kind.Capsule:
                    Vector3 end = capsuleEnd != null ? capsuleEnd.position : p;
                    if (stopShortOfEnd && capsuleEnd != null)
                        end -= (end - p).normalized * radius;
                    a = new Vector4(p.x, p.y, p.z, 2f);
                    b = new Vector4(end.x, end.y, end.z, radius);
                    break;
                default:
                    a = new Vector4(p.x, p.y, p.z, 0f);
                    b = new Vector4(0f, 0f, 0f, radius);
                    break;
            }
        }

        void OnDrawGizmosSelected()
        {
            Gizmos.color = new Color(1f, 0.6f, 0.2f);
            if (kind == Kind.Box) Gizmos.DrawWireCube(transform.position, transform.lossyScale);
            else Gizmos.DrawWireSphere(transform.position, radius);
            if (kind == Kind.Capsule && capsuleEnd != null) Gizmos.DrawLine(transform.position, capsuleEnd.position);
        }
    }
}
