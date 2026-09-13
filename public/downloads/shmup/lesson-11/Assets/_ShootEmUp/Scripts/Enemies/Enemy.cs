using System;
using ShootEmUp.Combat;
using ShootEmUp.Data;
using UnityEngine;

namespace ShootEmUp.Enemies
{
    /// <summary>
    /// Glue between an <see cref="EnemyData"/> asset and the generic enemy prefab.
    /// Pushes the data into SpriteRenderer, CircleCollider2D, Health, EnemyMover and DamageOnContact every time
    /// the enemy is enabled, so one prefab can play every enemy type. Announces kills through <see cref="Killed"/>.
    /// </summary>
    [RequireComponent(typeof(SpriteRenderer), typeof(Health), typeof(EnemyMover))]
    [RequireComponent(typeof(DamageOnContact), typeof(CircleCollider2D))]
    public sealed class Enemy : MonoBehaviour
    {
        /// <summary>
        /// Raised when any enemy's Health reaches zero. Static so listeners (score, drops, audio) do not need to
        /// track every pooled instance. The enemy is still alive at this moment, so position and Data are valid.
        /// </summary>
        public static event Action<Enemy> Killed;

        [Tooltip("Which enemy type this instance is. Swap the asset, not the prefab.")]
        [SerializeField] private EnemyData data;

        public EnemyData Data => data;

        private SpriteRenderer spriteRenderer;
        private CircleCollider2D circle;
        private Health health;
        private EnemyMover mover;
        private DamageOnContact contactDamage;

        private void Awake()
        {
            spriteRenderer = GetComponent<SpriteRenderer>();
            circle = GetComponent<CircleCollider2D>();
            health = GetComponent<Health>();
            mover = GetComponent<EnemyMover>();
            contactDamage = GetComponent<DamageOnContact>();
            health.Died += OnDied;
        }

        private void OnDestroy()
        {
            health.Died -= OnDied;
        }

        private void OnEnable()
        {
            if (data == null)
            {
                Debug.LogError($"{name}: no EnemyData assigned, enemy will use prefab defaults.", this);
                return;
            }

            Apply(data);
        }

        /// <summary>Used by spawners (lesson 07) to turn a pooled instance into a specific enemy type.</summary>
        public void Apply(EnemyData newData)
        {
            data = newData;
            spriteRenderer.sprite = data.sprite;
            circle.radius = data.colliderRadius;
            health.SetMax(data.maxHealth);
            mover.Speed = data.speed;
            mover.RotationSpeed = data.rotationSpeed;
            contactDamage.Damage = data.contactDamage;
        }

        private void OnDied(Health _)
        {
            Killed?.Invoke(this);
        }
    }
}
