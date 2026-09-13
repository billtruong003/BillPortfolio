using System;
using UnityEngine;

namespace ShootEmUp.Data
{
    /// <summary>
    /// An ordered list of waves. Each wave spawns one enemy type N times with a gap between spawns,
    /// then waits before the next wave. Designers edit this asset, the spawner only reads it.
    /// </summary>
    [CreateAssetMenu(menuName = "ShootEmUp/Wave Set", fileName = "Waves_New")]
    public sealed class WaveSet : ScriptableObject
    {
        [Serializable]
        public struct Wave
        {
            public EnemyData enemy;
            [Min(1)] public int count;
            [Tooltip("Seconds between two spawns inside this wave.")]
            [Min(0f)] public float interval;
            [Tooltip("Seconds to wait after the last spawn of this wave before the next wave starts.")]
            [Min(0f)] public float delayAfter;
        }

        public Wave[] waves = Array.Empty<Wave>();

        [Tooltip("Start again from the first wave when the last one is done.")]
        public bool loop = true;
    }
}
