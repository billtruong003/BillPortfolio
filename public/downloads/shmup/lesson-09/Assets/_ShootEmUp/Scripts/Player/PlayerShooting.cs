using BillLab.Common.Pooling;
using ShootEmUp.Combat;
using ShootEmUp.Data;
using UnityEngine;
using UnityEngine.InputSystem;

namespace ShootEmUp.Player
{
    /// <summary>
    /// Takes a projectile from the pool at the muzzle while Gameplay/Fire is held.
    /// Fire rate, projectile speed and damage come from a <see cref="WeaponData"/> asset (lesson 06);
    /// a pickup can temporarily override it (lesson 09).
    /// </summary>
    public sealed class PlayerShooting : MonoBehaviour
    {
        [Tooltip("Input Actions asset that contains the Gameplay/Fire action.")]
        [SerializeField] private InputActionAsset controls;

        [Tooltip("Pool that owns the projectile prefab.")]
        [SerializeField] private PrefabPool projectilePool;

        [Tooltip("Where the projectile appears. A child Transform at the ship's nose.")]
        [SerializeField] private Transform muzzle;

        [Tooltip("Numbers for this weapon. Swap the asset to change how the ship shoots.")]
        [SerializeField] private WeaponData weapon;

        private InputAction fireAction;
        private float nextShotTime;
        private WeaponData overrideWeapon;

        private WeaponData ActiveWeapon => overrideWeapon != null ? overrideWeapon : weapon;

        private void Awake()
        {
            fireAction = controls.FindAction("Gameplay/Fire", throwIfNotFound: true);
        }

        private void OnEnable()
        {
            fireAction.Enable();
        }

        private void OnDisable()
        {
            fireAction.Disable();
        }

        public void OverrideWeapon(WeaponData temporary)
        {
            overrideWeapon = temporary;
        }

        public void ClearOverride()
        {
            overrideWeapon = null;
        }

        private void Update()
        {
            if (!fireAction.IsPressed() || Time.time < nextShotTime)
            {
                return;
            }

            var w = ActiveWeapon;
            var shot = projectilePool.Get(muzzle.position, muzzle.rotation);
            shot.GetComponent<Projectile>().Configure(w.projectileSpeed, w.damage);
            nextShotTime = Time.time + 1f / w.shotsPerSecond;
        }
    }
}
