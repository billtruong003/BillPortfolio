using System;
using BillLab.Common.Pooling;
using UnityEngine;

namespace ShootEmUp.Combat
{
    /// <summary>
    /// Hit points for anything that can be destroyed. When it reaches zero the object is released to its pool
    /// (or destroyed when it is not pooled). Other scripts subscribe to <see cref="Changed"/> / <see cref="Died"/>
    /// for HUD, score, VFX, game over.
    /// </summary>
    [DefaultExecutionOrder(-100)]
    public sealed class Health : MonoBehaviour
    {
        [Tooltip("Hit points at spawn. Restored every time the object is enabled, so pooled objects come back full.")]
        [SerializeField] private int maxHealth = 1;

        [Tooltip("Enemies and projectiles vanish when they die (pool release or Destroy). The player ship stays so the HUD and Game Over screen can still read it.")]
        [SerializeField] private bool removeOnDeath = true;

        public int Max => maxHealth;
        public int Current { get; private set; }
        public bool IsDead => Current <= 0;

        /// <summary>While true, TakeDamage does nothing (shield pickup).</summary>
        public bool Invulnerable { get; set; }

        /// <summary>Raised whenever Current changes (damage, heal, refill).</summary>
        public event Action<Health> Changed;
        public event Action<Health> Damaged;

        /// <summary>Raised once when Current drops to zero.</summary>
        public event Action<Health> Died;

        private void OnEnable()
        {
            Current = maxHealth;
            Invulnerable = false;
            Changed?.Invoke(this);
        }

        /// <summary>Change the maximum and refill. Used by data-driven spawners (lesson 06).</summary>
        public void SetMax(int value)
        {
            maxHealth = Mathf.Max(1, value);
            Current = maxHealth;
            Changed?.Invoke(this);
        }

        public void Heal(int amount)
        {
            if (IsDead || amount <= 0) return;
            Current = Mathf.Min(maxHealth, Current + amount);
            Changed?.Invoke(this);
        }

        public void TakeDamage(int amount)
        {
            if (IsDead || Invulnerable || amount <= 0) return;

            Current = Mathf.Max(0, Current - amount);
            Changed?.Invoke(this);
            Damaged?.Invoke(this);
            if (!IsDead) return;

            Died?.Invoke(this);
            if (!removeOnDeath) return;

            var pooled = GetComponent<PooledObject>();
            if (pooled != null) pooled.Release();
            else Destroy(gameObject);
        }
    }
}
