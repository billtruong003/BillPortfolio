using UnityEngine;

namespace ShootEmUp.Data
{
    /// <summary>
    /// Everything that makes one enemy type different from another. One asset per type; the prefab stays generic.
    /// </summary>
    [CreateAssetMenu(menuName = "ShootEmUp/Enemy Data", fileName = "Enemy_New")]
    public sealed class EnemyData : ScriptableObject
    {
        [Header("Look")]
        public Sprite sprite;

        [Header("Stats")]
        [Min(1)] public int maxHealth = 2;
        [Min(0f)] public float speed = 3f;
        [Min(0)] public int contactDamage = 1;

        [Header("Reward")]
        [Min(0)] public int scoreValue = 10;
    }
}
