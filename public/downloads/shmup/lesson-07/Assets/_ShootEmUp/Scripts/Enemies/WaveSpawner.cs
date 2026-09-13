using System.Collections;
using BillLab.Common.Pooling;
using ShootEmUp.Core;
using ShootEmUp.Data;
using UnityEngine;

namespace ShootEmUp.Enemies
{
    /// <summary>
    /// Plays a <see cref="WaveSet"/>: takes enemies from the pool, gives them their <see cref="EnemyData"/>,
    /// and drops them just above the top edge at a random x. One coroutine drives the whole timeline.
    /// </summary>
    public sealed class WaveSpawner : MonoBehaviour
    {
        [Tooltip("Pool of the generic enemy prefab.")]
        [SerializeField] private PrefabPool enemyPool;

        [Tooltip("Which waves to play, in order.")]
        [SerializeField] private WaveSet waveSet;

        [Tooltip("How far above the visible top edge enemies appear.")]
        [SerializeField] private float spawnMargin = 1.5f;

        [Tooltip("Keep spawns this far from the left/right edges so big asteroids are not half off-screen.")]
        [SerializeField] private float horizontalPadding = 1f;

        [Tooltip("Seconds before the first wave, so the player can get ready.")]
        [SerializeField] private float initialDelay = 1f;

        private Coroutine running;

        private void OnEnable()
        {
            running = StartCoroutine(Run());
        }

        private void OnDisable()
        {
            if (running != null) StopCoroutine(running);
        }

        private IEnumerator Run()
        {
            if (waveSet == null || waveSet.waves == null || waveSet.waves.Length == 0) yield break;
            yield return new WaitForSeconds(initialDelay);

            do
            {
                foreach (var wave in waveSet.waves)
                {
                    if (wave.enemy == null || wave.count < 1) continue;
                    for (var i = 0; i < wave.count; i++)
                    {
                        Spawn(wave.enemy);
                        if (i + 1 < wave.count) yield return new WaitForSeconds(Mathf.Max(0f, wave.interval));
                    }

                    yield return new WaitForSeconds(wave.delayAfter);
                }
                yield return null;
            }
            while (waveSet.loop);
        }

        private void Spawn(EnemyData data)
        {
            var bounds = ScreenBounds.Get();
            var x = Random.Range(bounds.xMin + horizontalPadding, bounds.xMax - horizontalPadding);
            var position = new Vector3(x, bounds.yMax + spawnMargin, 0f);

            var enemy = enemyPool.Get(position, Quaternion.identity);
            enemy.GetComponent<Enemy>().Apply(data);
        }
    }
}
