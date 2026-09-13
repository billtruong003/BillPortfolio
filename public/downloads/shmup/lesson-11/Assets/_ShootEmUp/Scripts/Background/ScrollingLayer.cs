using UnityEngine;
namespace ShootEmUp.Background
{
    public sealed class ScrollingLayer : MonoBehaviour
    {
        [SerializeField, Min(0f)] private float speed = 1f;
        [SerializeField, Min(0.01f)] private float wrapDistance = 10f;
        private Vector3 startPosition;
        private float distance;
        private void Awake() => startPosition = transform.position;
        private void Update()
        {
            distance = Mathf.Repeat(distance + speed * Time.deltaTime, Mathf.Max(0.01f, wrapDistance));
            transform.position = startPosition + Vector3.down * distance;
        }
    }
}
