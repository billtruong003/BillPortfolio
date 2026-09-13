using System;
using ShootEmUp.Combat;
using ShootEmUp.Data;
using ShootEmUp.Enemies;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace ShootEmUp.Core
{
    /// <summary>
    /// One run of the game: score, game over, restart. Listens to gameplay events, never touches UI directly;
    /// the HUD listens to this. One per scene, referenced by the HUD.
    /// </summary>
    public sealed class GameSession : MonoBehaviour
    {
        [Tooltip("The ship. Its Health decides when the run ends.")]
        [SerializeField] private Health player;

        [Tooltip("Objects switched off on game over (spawner, player controls).")]
        [SerializeField] private Behaviour[] disableOnGameOver;

        public int Score { get; private set; }
        public bool IsOver { get; private set; }

        public event Action<int> ScoreChanged;
        public event Action GameOver;

        private void OnEnable()
        {
            Enemy.Killed += OnEnemyKilled;
            player.Died += OnPlayerDied;
        }

        private void OnDisable()
        {
            Enemy.Killed -= OnEnemyKilled;
            player.Died -= OnPlayerDied;
        }

        public void Restart()
        {
            SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
        }

        private void OnEnemyKilled(Enemy enemy)
        {
            if (IsOver) return;
            Score += enemy.Data.scoreValue;
            ScoreChanged?.Invoke(Score);
        }

        private void OnPlayerDied(Health _)
        {
            if (IsOver) return;
            IsOver = true;
            foreach (var b in disableOnGameOver) b.enabled = false;
            GameOver?.Invoke();
        }
    }
}
