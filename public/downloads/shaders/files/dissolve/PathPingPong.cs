using UnityEngine;

namespace BillShaderLab
{
    // Walks back and forth between two points, turning to face the way it goes.
    public class PathPingPong : MonoBehaviour
    {
        public Vector3 from;
        public Vector3 to;
        public float loopSeconds = 4f;

        void Update()
        {
            float phase = Time.time / loopSeconds % 1f;
            float t = phase < 0.5f ? phase * 2f : 2f - phase * 2f;
            t = t * t * (3f - 2f * t);
            transform.position = Vector3.Lerp(from, to, t);
            Vector3 heading = (phase < 0.5f ? to - from : from - to);
            heading.y = 0f;
            if (heading.sqrMagnitude > 1e-6f) transform.rotation = Quaternion.LookRotation(heading);
        }
    }
}
