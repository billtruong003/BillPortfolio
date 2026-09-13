using BillLab.Common.Pooling;
using ShootEmUp.Core;
using UnityEngine;

namespace ShootEmUp.Enemies
{
    /// <summary>
    /// Flies straight down and returns to the pool once it has left the bottom of the screen.
    /// </summary>
    [RequireComponent(typeof(Rigidbody2D), typeof(PooledObject))]
    public sealed class EnemyMover : MonoBehaviour
    {
        [Tooltip("World units per second, downwards.")]
        [SerializeField] private float speed = 3f;

        [Tooltip("Extra distance below the screen before the enemy is recycled, so it fully disappears first.")]
        [SerializeField] private float despawnMargin = 2f;

        public float Speed
        {
            get => speed;
            set => speed = Mathf.Max(0f, value);
        }

        private Rigidbody2D body;
        private PooledObject pooled;
        private float despawnY;

        private void Awake()
        {
            body = GetComponent<Rigidbody2D>();
            pooled = GetComponent<PooledObject>();
        }

        private void OnEnable()
        {
            despawnY = ScreenBounds.Get().yMin - despawnMargin;
        }

        private void FixedUpdate()
        {
            body.MovePosition(body.position + Vector2.down * (speed * Time.fixedDeltaTime));

            if (body.position.y < despawnY)
            {
                pooled.Release();
            }
        }
    }
}
