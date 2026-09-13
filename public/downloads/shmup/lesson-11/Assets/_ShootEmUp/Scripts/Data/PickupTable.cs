using System;
using UnityEngine;

namespace ShootEmUp.Data
{
    /// <summary>
    /// Weighted list of pickups. Heavier entries drop more often. Weights do not need to sum to anything.
    /// </summary>
    [CreateAssetMenu(menuName = "ShootEmUp/Pickup Table", fileName = "Pickups_New")]
    public sealed class PickupTable : ScriptableObject
    {
        [Serializable]
        public struct Entry
        {
            public PickupData pickup;
            [Min(0f)] public float weight;
        }

        public Entry[] entries = Array.Empty<Entry>();

        public PickupData Roll()
        {
            var total = 0f;
            if (entries == null) return null;
            foreach (var e in entries) if (e.pickup != null && e.weight > 0f) total += e.weight;
            if (total <= 0f) return null;

            var r = UnityEngine.Random.Range(0f, total);
            PickupData lastValid = null;
            foreach (var e in entries)
            {
                if (e.pickup == null || e.weight <= 0f) continue;
                lastValid = e.pickup;
                if (r < e.weight) return e.pickup;
                r -= e.weight;
            }
            return lastValid;
        }
    }
}

