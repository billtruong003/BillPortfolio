using System.Collections;
using UnityEngine;

namespace ShootEmUp.FX
{
    /// <summary>
    /// Shakes the camera by offsetting its local position with decaying random noise. Call <see cref="Shake"/>.
    /// Put it on the camera; the camera's rest position is remembered on enable.
    /// </summary>
    public sealed class CameraShake : MonoBehaviour
    {
        [SerializeField, Min(0f)] private float defaultStrength = 0.25f;
        [SerializeField, Min(0.01f)] private float defaultDuration = 0.2f;

        private Vector3 restPosition;
        private Coroutine routine;

        private void OnEnable()
        {
            restPosition = transform.localPosition;
        }

        private void OnDisable()
        {
            if (routine != null) StopCoroutine(routine);
            transform.localPosition = restPosition;
        }

        public void Shake() => Shake(defaultStrength, defaultDuration);

        public void Shake(float strength, float duration)
        {
            if (routine != null) StopCoroutine(routine);
            routine = StartCoroutine(Run(strength, duration));
        }

        private IEnumerator Run(float strength, float duration)
        {
            var elapsed = 0f;
            while (elapsed < duration)
            {
                elapsed += Time.deltaTime;
                var falloff = 1f - elapsed / duration;
                transform.localPosition = restPosition + (Vector3)(Random.insideUnitCircle * (strength * falloff));
                yield return null;
            }
            transform.localPosition = restPosition;
            routine = null;
        }
    }
}
