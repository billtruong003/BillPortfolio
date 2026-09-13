using ShootEmUp.Combat;
using ShootEmUp.Data;
using UnityEngine;

namespace ShootEmUp.Enemies
{
    /// <summary>
    /// Glue between an <see cref="EnemyData"/> asset and the generic enemy prefab.
    /// Pushes the data into SpriteRenderer, Health, EnemyMover and DamageOnContact every time the enemy is enabled,
    /// so one prefab can play every enemy type.
    /// </summary>
    [RequireComponent(typeof(SpriteRenderer), typeof(Health), typeof(EnemyMover))]
    [RequireComponent(typeof(DamageOnContact))]
    public sealed class Enemy : MonoBehaviour
    {
        [Tooltip("Which enemy type this instance is. Swap the asset, not the prefab.")]
        [SerializeField] private EnemyData data;

        public EnemyData Data => data;

        private SpriteRenderer spriteRenderer;
        private Health health;
        private EnemyMover mover;
        private DamageOnContact contactDamage;

        private void Awake()
        {
            spriteRenderer = GetComponent<SpriteRenderer>();
            health = GetComponent<Health>();
            mover = GetComponent<EnemyMover>();
            contactDamage = GetComponent<DamageOnContact>();
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
            health.SetMax(data.maxHealth);
            mover.Speed = data.speed;
            contactDamage.Damage = data.contactDamage;
        }
    }
}
