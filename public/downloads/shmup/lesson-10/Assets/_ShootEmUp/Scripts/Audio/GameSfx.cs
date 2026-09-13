using ShootEmUp.Combat;
using ShootEmUp.Core;
using ShootEmUp.Enemies;
using ShootEmUp.FX;
using ShootEmUp.Player;
using UnityEngine;

namespace ShootEmUp.Audio
{
    /// <summary>
    /// The one place that maps gameplay events to sounds and camera shake. Gameplay scripts never reference audio.
    /// One AudioSource, PlayOneShot for everything: short effects can overlap freely.
    /// </summary>
    [RequireComponent(typeof(AudioSource))]
    public sealed class GameSfx : MonoBehaviour
    {
        [Header("Sources")]
        [SerializeField] private PlayerShooting playerShooting;
        [SerializeField] private PlayerPowerups playerPowerups;
        [SerializeField] private Health playerHealth;
        [SerializeField] private GameSession session;
        [SerializeField] private CameraShake cameraShake;

        [Header("Clips")]
        [SerializeField] private AudioClip laser;
        [SerializeField] private AudioClip explosion;
        [SerializeField] private AudioClip hit;
        [SerializeField] private AudioClip pickup;
        [SerializeField] private AudioClip gameOver;

        [Header("Mix")]
        [SerializeField, Range(0f, 1f)] private float laserVolume = 0.35f;

        private AudioSource source;

        private void Awake()
        {
            source = GetComponent<AudioSource>();
        }

        private void OnEnable()
        {
            playerShooting.Fired += OnFired;
            playerPowerups.Collected += OnCollected;
            playerHealth.Damaged += OnPlayerHealthChanged;
            session.GameOver += OnGameOver;
            Enemy.Killed += OnEnemyKilled;
        }

        private void OnDisable()
        {
            playerShooting.Fired -= OnFired;
            playerPowerups.Collected -= OnCollected;
            playerHealth.Damaged -= OnPlayerHealthChanged;
            session.GameOver -= OnGameOver;
            Enemy.Killed -= OnEnemyKilled;
        }

        private void OnFired() => source.PlayOneShot(laser, laserVolume);
        private void OnCollected(Data.PickupData _) => source.PlayOneShot(pickup);
        private void OnGameOver() => source.PlayOneShot(gameOver);

        private void OnEnemyKilled(Enemy _)
        {
            source.PlayOneShot(explosion, 0.8f);
            if (cameraShake != null) cameraShake.Shake(0.12f, 0.15f);
        }

        private void OnPlayerHealthChanged(Health h)
        {
            if (!isActiveAndEnabled) return;

            source.PlayOneShot(hit);
            if (cameraShake != null) cameraShake.Shake();
        }
    }
}

