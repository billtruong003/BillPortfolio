using BillLab.Common.Pooling;
using ShootEmUp.Data;
using ShootEmUp.Enemies;
using UnityEngine;

namespace ShootEmUp.Pickups
{
    /// <summary>
    /// Listens for enemy kills and sometimes drops a pickup where the enemy died.
    /// Chance comes from the enemy's data, which pickup from the table.
    /// </summary>
    public sealed class PickupDropper : MonoBehaviour
    {
        [SerializeField] private PrefabPool pickupPool;
        [SerializeField] private PickupTable table;

        private void OnEnable()
        {
            Enemy.Killed += OnEnemyKilled;
        }

        private void OnDisable()
        {
            Enemy.Killed -= OnEnemyKilled;
        }

        private void OnEnemyKilled(Enemy enemy)
        {
            if (enemy.Data.dropChance <= 0f || Random.value >= enemy.Data.dropChance) return;

            var pickup = table.Roll();
            if (pickup == null) return;

            pickupPool.Get(enemy.transform.position, Quaternion.identity).GetComponent<Pickup>().Apply(pickup);
        }
    }
}
