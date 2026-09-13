using BillLab.Common.Pooling;
using UnityEngine;

namespace ShootEmUp.FX
{
    /// <summary>
    /// Restarts the ParticleSystem when taken from the pool and returns to the pool when it stops.
    /// Requires the ParticleSystem's Stop Action to be 'Callback' (set in the prefab).
    /// </summary>
    [RequireComponent(typeof(ParticleSystem), typeof(PooledObject))]
    public sealed class PooledParticle : MonoBehaviour
    {
        private ParticleSystem system;
        private PooledObject pooled;

        private void Awake()
        {
            system = GetComponent<ParticleSystem>();
            pooled = GetComponent<PooledObject>();
        }

        private void OnEnable()
        {
            system.Play(true);
        }

        private void OnParticleSystemStopped()
        {
            pooled.Release();
        }
    }
}
