using ShootEmUp.Combat;
using ShootEmUp.Core;
using TMPro;
using UnityEngine;

namespace ShootEmUp.UI
{
    /// <summary>
    /// Shows score and player hit points, and the Game Over panel. Pure listener: it never changes game state
    /// except forwarding the Restart button to <see cref="GameSession"/>.
    /// </summary>
    public sealed class HudView : MonoBehaviour
    {
        [Header("Sources")]
        [SerializeField] private GameSession session;
        [SerializeField] private Health playerHealth;

        [Header("Widgets")]
        [SerializeField] private TMP_Text scoreText;
        [SerializeField] private TMP_Text healthText;
        [SerializeField] private GameObject gameOverPanel;
        [SerializeField] private TMP_Text finalScoreText;

        private void OnEnable()
        {
            session.ScoreChanged += OnScoreChanged;
            session.GameOver += OnGameOver;
            playerHealth.Changed += OnHealthChanged;

            OnScoreChanged(session.Score);
            OnHealthChanged(playerHealth);
            gameOverPanel.SetActive(session.IsOver);
            if (session.IsOver) OnGameOver();
        }

        private void Start()
        {
            OnScoreChanged(session.Score);
            OnHealthChanged(playerHealth);
        }

        private void OnDisable()
        {
            session.ScoreChanged -= OnScoreChanged;
            session.GameOver -= OnGameOver;
            playerHealth.Changed -= OnHealthChanged;
        }

        /// <summary>Hooked to the Restart button's OnClick in the Inspector.</summary>
        public void OnRestartClicked()
        {
            session.Restart();
        }

        private void OnScoreChanged(int score)
        {
            scoreText.text = $"SCORE {score:000000}";
        }

        private void OnHealthChanged(Health health)
        {
            healthText.text = $"HP {new string('|', health.Current)}{new string('.', health.Max - health.Current)}";
        }

        private void OnGameOver()
        {
            finalScoreText.text = $"FINAL SCORE {session.Score}";
            gameOverPanel.SetActive(true);
        }
    }
}
