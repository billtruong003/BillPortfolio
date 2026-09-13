using BillLab.Common.Pooling;
using ShootEmUp.Enemies;
using UnityEngine;

namespace ShootEmUp.FX
{
    /// <summary>
    /// Plays a pooled particle burst wherever an enemy dies. The prefab carries a ParticleSystem set to
    /// Stop Action = Callback so it can return itself to the pool when finished (see <see cref="PooledParticle"/>).
    /// </summary>
    public sealed class ExplosionOnKill : MonoBehaviour
    {
        [SerializeField] private PrefabPool explosionPool;

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
            var scale = Mathf.Max(0.6f, enemy.Data.colliderRadius * 2f);
            explosionPool.Get(enemy.transform.position, Quaternion.identity, new Vector3(scale, scale, 1f));
        }
    }
}
