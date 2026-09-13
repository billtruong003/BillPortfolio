using BillLab.Common.Pooling;
using UnityEngine;

namespace ShootEmUp.Combat
{
    /// <summary>
    /// Moves straight along its local up axis and returns itself to the pool after <see cref="lifetime"/> seconds.
    /// Lesson 03 used Destroy(gameObject, lifetime); lesson 04 swapped that for <see cref="PooledObject.Release"/>.
    /// </summary>
    [RequireComponent(typeof(Rigidbody2D), typeof(PooledObject))]
    public sealed class Projectile : MonoBehaviour
    {
        [Tooltip("World units per second.")]
        [SerializeField] private float speed = 14f;

        [Tooltip("Seconds before the projectile goes back to the pool, even if it hit nothing.")]
        [SerializeField] private float lifetime = 2f;

        private Rigidbody2D body;
        private PooledObject pooled;
        private float despawnTime;

        private void Awake()
        {
            body = GetComponent<Rigidbody2D>();
            pooled = GetComponent<PooledObject>();
        }

        private void OnEnable()
        {
            despawnTime = Time.time + lifetime;
        }

        private void Update()
        {
            if (Time.time >= despawnTime)
            {
                pooled.Release();
            }
        }

        private void FixedUpdate()
        {
            body.MovePosition(body.position + (Vector2)transform.up * (speed * Time.fixedDeltaTime));
        }
    }
}
