using BillLab.Common.Pooling;
using UnityEngine;
using UnityEngine.InputSystem;

namespace ShootEmUp.Player
{
    /// <summary>
    /// Takes a projectile from the pool at the muzzle while Gameplay/Fire is held, limited by <see cref="shotsPerSecond"/>.
    /// </summary>
    public sealed class PlayerShooting : MonoBehaviour
    {
        [Tooltip("Input Actions asset that contains the Gameplay/Fire action.")]
        [SerializeField] private InputActionAsset controls;

        [Tooltip("Pool that owns the projectile prefab. Lesson 03 held the prefab directly and called Instantiate.")]
        [SerializeField] private PrefabPool projectilePool;

        [Tooltip("Where the projectile appears. A child Transform at the ship's nose.")]
        [SerializeField] private Transform muzzle;

        [Tooltip("Fire rate while the button is held.")]
        [SerializeField] private float shotsPerSecond = 6f;

        private InputAction fireAction;
        private float nextShotTime;

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

        private void Update()
        {
            if (!fireAction.IsPressed() || Time.time < nextShotTime)
            {
                return;
            }

            projectilePool.Get(muzzle.position, muzzle.rotation);
            nextShotTime = Time.time + 1f / shotsPerSecond;
        }
    }
}
