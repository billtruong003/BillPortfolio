using UnityEngine;

namespace BillShaderLab
{
    // Grows a TransitionShape from nothing to full size and back, on a cosine, with a phase
    // offset so several shapes can open one after another.
    [RequireComponent(typeof(TransitionShape))]
    public class ShapePulse : MonoBehaviour
    {
        public float maxRadius = 2f;
        public Vector3 maxBoxSize = new Vector3(3f, 3f, 3f);
        public float loopSeconds = 4f;
        [Range(0f, 1f)] public float phase;

        TransitionShape shape;

        void OnEnable() => shape = GetComponent<TransitionShape>();

        void Update()
        {
            float t = 0.5f - 0.5f * Mathf.Cos((Time.time / loopSeconds + phase) * Mathf.PI * 2f);
            if (shape.kind == TransitionShape.Kind.Box) transform.localScale = maxBoxSize * t;
            else shape.radius = maxRadius * t;
        }
    }
}
