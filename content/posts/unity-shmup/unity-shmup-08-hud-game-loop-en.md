---
title: "Shmup #8: A run's lifecycle — score, health, Game Over, and Restart"
date: "2026-09-21"
updated: "2026-09-13"
lang: en
translationKey: unity-shmup-08-hud-game-loop
series: "shmup"
order: 8
excerpt: "Begin with run states, divide Health, GameSession, and HUD responsibilities, then connect events and restart without broken references."
coverImage: "/images/posts/unity-shmup/08/cover.webp"
category: "unity-dev"
tags: ["Unity", "Unity 6", "Shmup", "Tutorial"]
published: true
featured: false
---

<div class="lesson-state"><strong>Playing → Game Over → Restart → Playing</strong><p>Playing: accept input, spawn enemies, award points.<br/>Game Over: disable controls and player colliders, stop spawning, show results.<br/>Restart: reload the scene for a fresh run.</p></div>

## Define the ending before drawing the HUD

Lesson 7 runs continuously without defining a run. Save `SEU_08_HUD`. A fresh run starts at 0 score and 3 HP. At zero HP, the player remains visible but no longer moves, shoots, or receives contacts, and no new enemies spawn. Existing bullets and enemies may continue moving; the final score stays fixed.

This is **Game Over**, not pause. We do not set timeScale to zero, so backgrounds and effects can continue.

## Separate state ownership from presentation

| Component | Owns | Output |
|---|---|---|
| Health | Current, Max, IsDead | Changed, Damaged, Died |
| Enemy | Instance Data | Killed carrying the Enemy |
| GameSession | Score, IsOver | ScoreChanged, GameOver |
| HudView | Widget references | Text and panel updates |
| RestartButton | A UI interaction | Calls GameSession.Restart |

<div class="lesson-flow"><span>Enemy.Health.Died</span><span>Enemy.Killed</span><span>GameSession.Score</span><span>HudView</span></div>

Killed carries Enemy from the start, allowing listeners to read both data and position. It fires **before** pool release. Scoring, pickups, and effects can share this moment without changing the event signature later.

Replace Enemy with the complete lesson 8 file. It subscribes to Health.Died, forwards static Killed, and unsubscribes when destroyed. Static lets a session hear every enemy, but listeners must unsubscribe to avoid retaining objects from an old scene.

## Finish GameSession before the UI

Create GameSession:

**Assets/_ShootEmUp/Scripts/Core/GameSession.cs**

```csharp
using System;
using ShootEmUp.Combat;
using ShootEmUp.Data;
using ShootEmUp.Enemies;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace ShootEmUp.Core
{
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
```

IsOver prevents duplicate endings and post-death scoring. Disable On Game Over stores components; disabling them keeps the ship visible, unlike disabling its entire GameObject.

Create an empty **GameSession**, add the script, and connect:

| Field | Reference |
|---|---|
| Player | Player's Health |
| Disable On Game Over [0] | PlayerMovement |
| [1] | PlayerShooting |
| [2] | WaveSpawner |
| [3] | Player's PolygonCollider2D |

Player Health must have **Remove On Death = false**, established in lesson 5. Add every relevant child collider if your player has several. Do not defer disabling dead-player contacts until the pickup lesson.

## Build the HUD from a wireframe

```text
┌──────────────────────────────┐
│ SCORE 000000          HP |||  │
│                              │
│          GAME OVER           │  panel shown after death
│      FINAL SCORE 000120      │
│           RESTART            │
└──────────────────────────────┘
```

Create a Canvas named HUD using GameObject → UI. Choose **Screen Space Overlay**. Set Canvas Scaler to **Scale With Screen Size**, Reference Resolution **1080 × 1920**, Match 0.5. Import TMP Essentials when creating your first TMP Text.

Use **InputSystemUIInputModule** on EventSystem. Replace StandaloneInputModule if present. Its default UI actions handle clicking and navigation; this lesson does not implement a pause menu or add a UI map to the Gameplay asset.

| Object | Anchor / Pivot | Position / Size | Text |
|---|---|---|---|
| ScoreText | (0,1) / (0,1) | (40,−40) / (600,70) | 48, left aligned |
| HealthText | (1,1) / (1,1) | (−40,−40) / (400,70) | 48, right aligned |
| GameOverPanel | stretch both axes | all four offsets = 0 | Black Image, alpha 0.75 |
| Title, panel child | center / center | (0,200) / (900,160) | GAME OVER, 120 |
| FinalScoreText | center / center | (0,40) / (900,80) | 56 |
| RestartButton | center / center | (0,−160) / (480,130) | TMP Label child, RESTART |

An anchor belongs to the parent; a pivot belongs to the widget. Top-left anchoring keeps ScoreText in that corner when proportions change. Disable GameOverPanel initially, not the entire HUD.

## Connect HudView and Restart

ShootEmUp.asmdef needs **Unity.TextMeshPro** and **UnityEngine.UI** references alongside Input System/Common. The lesson 8 source provides this configuration.

**Assets/_ShootEmUp/Scripts/UI/HudView.cs**

```csharp
using ShootEmUp.Combat;
using ShootEmUp.Core;
using TMPro;
using UnityEngine;

namespace ShootEmUp.UI
{
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
```

HudView subscribes to events and reads current state. Start synchronizes after scene initialization, avoiding reliance on another object's OnEnable order.

Attach HudView to HUD and assign Session, Player Health, Score Text, Health Text, Game Over Panel, and Final Score Text. In RestartButton → Button → On Click, drag HUD and select HudView.OnRestartClicked.

Under **File → Build Profiles → Scene List**, add the open SEU_08_HUD scene. Restart uses the active scene's build index, so it must be registered.

## Exercise all three states

A new run must show zero score and full HP before any hit. Killing InsectBasic awards 10 points; letting it leave the screen awards none. Take three hits: show the panel, stop controls, disable player collisions, and stop new spawns.

Restart across three runs. Score resets, health refills, and each kill awards points once. Doubled scores suggest duplicate subscriptions; broken player references suggest Remove On Death is enabled. The run lifecycle is now complete and ready for pickups.

## Source for this stage

[Download all lesson 8 scripts](/downloads/shmup/lesson-08.zip). The archive contains code and assembly definitions, not scenes, prefabs, or the pictured artwork. Assemble the scene using this lesson. When upgrading, replace files at the same paths; never put two versions of a class in Assets.


Next: [Shmup #9](/lab/unity-shmup-09-pickups-shield-en).
