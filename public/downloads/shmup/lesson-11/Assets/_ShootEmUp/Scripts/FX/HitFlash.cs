using System.Collections;
using ShootEmUp.Combat;
using UnityEngine;

namespace ShootEmUp.FX
{
    /// <summary>
    /// Flashes the sprite white for a few frames whenever its <see cref="Health"/> loses hit points.
    /// Uses a MaterialPropertyBlock so all sprites keep sharing one material (no per-object material copies).
    /// The material must use the ShootEmUp/SpriteFlash shader.
    /// </summary>
    [RequireComponent(typeof(SpriteRenderer), typeof(Health))]
    public sealed class HitFlash : MonoBehaviour
    {
        private static readonly int FlashAmount = Shader.PropertyToID("_FlashAmount");

        [SerializeField, Min(0.01f)] private float duration = 0.08f;

        private SpriteRenderer spriteRenderer;
        private Health health;
        private MaterialPropertyBlock block;
        private Coroutine routine;

        private void Awake()
        {
            spriteRenderer = GetComponent<SpriteRenderer>();
            health = GetComponent<Health>();
            block = new MaterialPropertyBlock();
            health.Damaged += OnHealthChanged;
        }

        private void OnDestroy()
        {
            health.Damaged -= OnHealthChanged;
        }

        private void OnEnable()
        {
            SetFlash(0f);
        }

        private void OnDisable()
        {
            if (routine != null) StopCoroutine(routine);
            routine = null;
            SetFlash(0f);
        }

        private void OnHealthChanged(Health h)
        {
            if (!isActiveAndEnabled) return;

            if (routine != null) StopCoroutine(routine);
            routine = StartCoroutine(Flash());
        }

        private IEnumerator Flash()
        {
            SetFlash(1f);
            yield return new WaitForSeconds(duration);
            SetFlash(0f);
            routine = null;
        }

        private void SetFlash(float amount)
        {
            spriteRenderer.GetPropertyBlock(block);
            block.SetFloat(FlashAmount, amount);
            spriteRenderer.SetPropertyBlock(block);
        }
    }
}

