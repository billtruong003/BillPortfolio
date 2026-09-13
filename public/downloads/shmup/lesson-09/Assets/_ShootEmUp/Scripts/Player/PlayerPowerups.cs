using System.Collections;
using ShootEmUp.Combat;
using ShootEmUp.Data;
using UnityEngine;

namespace ShootEmUp.Player
{
    /// <summary>
    /// Turns collected <see cref="PickupData"/> into effects on the ship: heal, timed shield, timed weapon swap.
    /// Timed effects use coroutines and restart cleanly if the same pickup is collected again.
    /// </summary>
    [RequireComponent(typeof(Health), typeof(PlayerShooting))]
    public sealed class PlayerPowerups : MonoBehaviour
    {
        [Tooltip("Child object shown while the shield is active (sprite 'shield').")]
        [SerializeField] private GameObject shieldVisual;

        private Health health;
        private PlayerShooting shooting;
        private Coroutine shieldRoutine;
        private Coroutine weaponRoutine;

        private void Awake()
        {
            health = GetComponent<Health>();
            shooting = GetComponent<PlayerShooting>();
        }

        private void OnEnable()
        {
            ClearEffects();
            health.Died += OnDied;
        }

        private void OnDisable()
        {
            health.Died -= OnDied;
            ClearEffects();
        }
        private void OnDied(Health _) => ClearEffects();
        private void ClearEffects()
        {
            StopAllCoroutines();
            shieldRoutine = null;
            weaponRoutine = null;
            health.Invulnerable = false;
            shooting.ClearOverride();
            if (shieldVisual != null) shieldVisual.SetActive(false);
        }

        public void Collect(PickupData data)
        {
            if (!isActiveAndEnabled || health.IsDead || data == null) return;
            switch (data.kind)
            {
                case PickupKind.ExtraLife:
                    health.Heal(1);
                    break;
                case PickupKind.Shield:
                    Restart(ref shieldRoutine, ShieldFor(data.duration));
                    break;
                case PickupKind.RapidFire:
                    Restart(ref weaponRoutine, WeaponFor(data.weaponOverride, data.duration));
                    break;
            }
        }

        private void Restart(ref Coroutine slot, IEnumerator routine)
        {
            if (slot != null) StopCoroutine(slot);
            slot = StartCoroutine(routine);
        }

        private IEnumerator ShieldFor(float seconds)
        {
            health.Invulnerable = true;
            if (shieldVisual != null) shieldVisual.SetActive(true);
            yield return new WaitForSeconds(seconds);
            health.Invulnerable = false;
            if (shieldVisual != null) shieldVisual.SetActive(false);
        }

        private IEnumerator WeaponFor(WeaponData weapon, float seconds)
        {
            shooting.OverrideWeapon(weapon);
            yield return new WaitForSeconds(seconds);
            shooting.ClearOverride();
        }
    }
}
