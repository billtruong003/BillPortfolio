using UnityEngine;
using UnityEngine.Pool;
namespace BillLab.Common.Pooling
{
    public sealed class PrefabPool : MonoBehaviour
    {
        [SerializeField] private GameObject prefab;
        [SerializeField, Min(0)] private int prewarm = 20;
        [SerializeField, Min(1)] private int maxSize = 100;
        private ObjectPool<GameObject> pool;
        private Transform staging;
        public int CountActive => pool.CountActive;
        public int CountInactive => pool.CountInactive;
        private void Awake()
        {
            var holder = new GameObject("Inactive factory");
            holder.SetActive(false);
            staging = holder.transform;
            staging.SetParent(transform, false);
            pool = new ObjectPool<GameObject>(Create, null,
                go => go.SetActive(false), go => Destroy(go), true,
                Mathf.Max(1, prewarm), Mathf.Max(1, maxSize));
            var warm = new GameObject[Mathf.Min(prewarm, Mathf.Max(1, maxSize))];
            for (var i = 0; i < warm.Length; i++) warm[i] = pool.Get();
            foreach (var go in warm) pool.Release(go);
        }
        private GameObject Create()
        {
            var go = Instantiate(prefab, staging);
            go.SetActive(false);
            go.transform.SetParent(transform, false);
            var pooled = go.GetComponent<PooledObject>();
            if (pooled == null) pooled = go.AddComponent<PooledObject>();
            pooled.Pool = this;
            return go;
        }
        public GameObject Get(Vector3 position, Quaternion rotation, Vector3? scale = null)
        {
            var go = pool.Get();
            go.transform.SetPositionAndRotation(position, rotation);
            go.transform.localScale = scale ?? prefab.transform.localScale;
            var body = go.GetComponent<Rigidbody2D>();
            if (body != null)
            {
                body.position = position;
                body.rotation = rotation.eulerAngles.z;
                body.linearVelocity = Vector2.zero;
                body.angularVelocity = 0f;
            }
            go.SetActive(true);
            return go;
        }
        public void Release(GameObject go) => pool.Release(go);
        private void OnDestroy() => pool?.Clear();
    }
}
