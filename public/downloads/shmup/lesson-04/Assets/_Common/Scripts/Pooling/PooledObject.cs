using UnityEngine;
namespace BillLab.Common.Pooling
{
    [DisallowMultipleComponent]
    public sealed class PooledObject : MonoBehaviour
    {
        public PrefabPool Pool { get; internal set; }
        private bool released;
        private void OnEnable() => released = false;
        public void Release()
        {
            if (released) return;
            released = true;
            if (Pool != null) Pool.Release(gameObject);
            else Destroy(gameObject);
        }
    }
}
