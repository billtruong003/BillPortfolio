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

        [Tooltip("Degrees per second. Asteroids tumble, insects do not.")]
        public float rotationSpeed = 0f;

        [Header("Body")]
        [Tooltip("Radius of the trigger circle in world units. Match it to the sprite (sprite px / PPU / 2, a bit smaller).")]
        [Min(0.05f)] public float colliderRadius = 0.45f;

        [Header("Stats")]
        [Min(1)] public int maxHealth = 2;
        [Min(0f)] public float speed = 3f;
        [Min(0)] public int contactDamage = 1;

        [Header("Reward")]
        [Min(0)] public int scoreValue = 10;

        [Tooltip("0 = never drops a pickup, 1 = always.")]
        [Range(0f, 1f)] public float dropChance = 0.15f;
    }
}
