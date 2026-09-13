using BillLab.Common.Pooling;
using UnityEngine;
namespace ShootEmUp.Combat
{
    [RequireComponent(typeof(Collider2D))]
    public sealed class DamageOnContact : MonoBehaviour
    {
        [SerializeField, Min(0)] private int damage = 1;
        [SerializeField] private bool releaseSelfOnHit = true;
        public int Damage { get => damage; set => damage = Mathf.Max(0, value); }
        private bool consumed;
        private void OnEnable() => consumed = false;
        private void OnTriggerEnter2D(Collider2D other)
        {
            if (consumed || !isActiveAndEnabled) return;
            var health = other.GetComponentInParent<Health>();
            if (health == null || health.IsDead) return;
            if (releaseSelfOnHit) consumed = true;
            health.TakeDamage(damage);
            if (!releaseSelfOnHit) return;
            var pooled = GetComponent<PooledObject>();
            if (pooled != null) pooled.Release();
            else Destroy(gameObject);
        }
    }
}
