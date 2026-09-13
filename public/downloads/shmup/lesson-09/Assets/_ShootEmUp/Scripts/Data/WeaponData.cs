using UnityEngine;

namespace ShootEmUp.Data
{
    /// <summary>
    /// Tunable numbers for one weapon. The projectile prefab and its pool live in the scene; this only carries data.
    /// </summary>
    [CreateAssetMenu(menuName = "ShootEmUp/Weapon Data", fileName = "Weapon_New")]
    public sealed class WeaponData : ScriptableObject
    {
        [Min(0.1f)] public float shotsPerSecond = 6f;
        [Min(0f)] public float projectileSpeed = 14f;
        [Min(1)] public int damage = 1;
    }
}
