using UnityEngine;

namespace BillShaderLab
{
    // Uploads every enabled TransitionShape to the shader globals once per frame.
    // One of these per scene; the shapes can live anywhere.
    [ExecuteAlways]
    public class TransitionMask : MonoBehaviour
    {
        const int MaxShapes = 16; // TRANSITION_MAX_SHAPES in BillTransition.hlsl

        static readonly int ShapeAId = Shader.PropertyToID("_TransitionShapeA");
        static readonly int ShapeBId = Shader.PropertyToID("_TransitionShapeB");
        static readonly int CountId = Shader.PropertyToID("_TransitionShapeCount");

        // Fixed-size arrays: Unity sizes a global array the first time it is set and never grows it.
        readonly Vector4[] shapeA = new Vector4[MaxShapes];
        readonly Vector4[] shapeB = new Vector4[MaxShapes];

        void LateUpdate()
        {
            int count = Mathf.Min(TransitionShape.Active.Count, MaxShapes);
            for (int i = 0; i < count; i++)
                TransitionShape.Active[i].Encode(out shapeA[i], out shapeB[i]);

            Shader.SetGlobalVectorArray(ShapeAId, shapeA);
            Shader.SetGlobalVectorArray(ShapeBId, shapeB);
            Shader.SetGlobalInteger(CountId, count);
        }

        void OnDisable() => Shader.SetGlobalInteger(CountId, 0);
    }
}
