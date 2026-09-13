using UnityEngine;

namespace ShootEmUp.Data
{
    public enum PickupKind
    {
        ExtraLife,
        Shield,
        RapidFire,
    }

    /// <summary>
    /// One kind of bonus. Which effect it has is a simple enum; the player decides what each kind does.
    /// </summary>
    [CreateAssetMenu(menuName = "ShootEmUp/Pickup Data", fileName = "Pickup_New")]
    public sealed class PickupData : ScriptableObject
    {
        public Sprite sprite;
        public PickupKind kind;

        [Tooltip("Seconds the effect lasts. Ignored by instant effects like Extra Life.")]
        [Min(0f)] public float duration = 6f;

        [Tooltip("Weapon swapped in while a Rapid Fire pickup is active.")]
        public WeaponData weaponOverride;

        [Min(0f)] public float fallSpeed = 2f;
    }
}
