using BillLab.Common.Pooling;
using UnityEngine;

namespace ShootEmUp.Combat
{
    /// <summary>
    /// Moves straight along its local up axis and returns itself to the pool after <see cref="lifetime"/> seconds.
    /// Speed and damage can be overridden per shot by the weapon that fired it (lesson 06).
    /// </summary>
    [RequireComponent(typeof(Rigidbody2D), typeof(PooledObject), typeof(DamageOnContact))]
    public sealed class Projectile : MonoBehaviour
    {
        [Tooltip("World units per second. Overridden by WeaponData when fired by PlayerShooting.")]
        [SerializeField] private float speed = 14f;

        [Tooltip("Seconds before the projectile goes back to the pool, even if it hit nothing.")]
        [SerializeField] private float lifetime = 2f;

        private Rigidbody2D body;
        private PooledObject pooled;
        private DamageOnContact contactDamage;
        private float despawnTime;

        private void Awake()
        {
            body = GetComponent<Rigidbody2D>();
            pooled = GetComponent<PooledObject>();
            contactDamage = GetComponent<DamageOnContact>();
        }

        private void OnEnable()
        {
            despawnTime = Time.time + lifetime;
        }

        public void Configure(float newSpeed, int damage)
        {
            speed = newSpeed;
            contactDamage.Damage = damage;
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
