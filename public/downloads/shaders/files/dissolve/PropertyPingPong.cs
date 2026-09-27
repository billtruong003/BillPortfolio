using UnityEngine;

namespace BillShaderLab
{
    public class PropertyPingPong : MonoBehaviour
    {
        public string property = "_Cutoff";
        public float from = 0f;
        public float to = 1f;
        public float loopSeconds = 3f;

        Renderer[] renderers;
        MaterialPropertyBlock block;
        int id;

        void Awake()
        {
            renderers = GetComponentsInChildren<Renderer>();
            block = new MaterialPropertyBlock();
            id = Shader.PropertyToID(property);
        }

        void Update()
        {
            float t = 0.5f - 0.5f * Mathf.Cos(Time.time / loopSeconds * Mathf.PI * 2f);
            foreach (var r in renderers)
            {
                r.GetPropertyBlock(block);
                block.SetFloat(id, Mathf.Lerp(from, to, t));
                r.SetPropertyBlock(block);
            }
        }
    }
}
