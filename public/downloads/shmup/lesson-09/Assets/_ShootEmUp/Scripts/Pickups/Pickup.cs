using BillLab.Common.Pooling;
using ShootEmUp.Core;
using ShootEmUp.Data;
using ShootEmUp.Player;
using UnityEngine;

namespace ShootEmUp.Pickups
{
    /// <summary>
    /// A falling bonus. Hands its <see cref="PickupData"/> to the player's <see cref="PlayerPowerups"/> on touch,
    /// then returns to the pool. Also recycles itself below the screen.
    /// </summary>
    [RequireComponent(typeof(SpriteRenderer), typeof(Rigidbody2D), typeof(PooledObject))]
    public sealed class Pickup : MonoBehaviour
    {
        [SerializeField] private PickupData data;

        [Tooltip("Extra distance below the screen before the pickup is recycled.")]
        [SerializeField] private float despawnMargin = 1.5f;

        private SpriteRenderer spriteRenderer;
        private Rigidbody2D body;
        private PooledObject pooled;
        private float despawnY;
        private bool consumed;

        private void Awake()
        {
            spriteRenderer = GetComponent<SpriteRenderer>();
            body = GetComponent<Rigidbody2D>();
            pooled = GetComponent<PooledObject>();
        }

        private void OnEnable()
        {
            consumed = false;
            despawnY = ScreenBounds.Get().yMin - despawnMargin;
            if (data != null) Apply(data);
        }

        public void Apply(PickupData newData)
        {
            data = newData;
            spriteRenderer.sprite = data.sprite;
        }

        private void FixedUpdate()
        {
            body.MovePosition(body.position + Vector2.down * (data.fallSpeed * Time.fixedDeltaTime));
            if (body.position.y < despawnY) pooled.Release();
        }

        private void OnTriggerEnter2D(Collider2D other)
        {
            if (consumed || !isActiveAndEnabled) return;
            var health = other.GetComponentInParent<ShootEmUp.Combat.Health>();
            if (health == null || health.IsDead) return;
            var powerups = other.GetComponentInParent<PlayerPowerups>();
            if (powerups == null) return;

            if (!powerups.isActiveAndEnabled) return;
            consumed = true;
            powerups.Collect(data);
            pooled.Release();
        }
    }
}
