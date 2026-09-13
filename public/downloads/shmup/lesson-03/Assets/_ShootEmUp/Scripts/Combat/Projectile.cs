using UnityEngine;

namespace ShootEmUp.Combat
{
    /// <summary>
    /// Moves straight along its local up axis and destroys itself after <see cref="lifetime"/> seconds.
    /// Lesson 03 version: plain Instantiate/Destroy. Lesson 04 replaces Destroy with an object pool.
    /// </summary>
    [RequireComponent(typeof(Rigidbody2D))]
    public sealed class Projectile : MonoBehaviour
    {
        [Tooltip("World units per second.")]
        [SerializeField] private float speed = 14f;

        [Tooltip("Seconds before the projectile removes itself, even if it hit nothing. Keeps the scene from filling up.")]
        [SerializeField] private float lifetime = 2f;

        private Rigidbody2D body;

        private void Awake()
        {
            body = GetComponent<Rigidbody2D>();
        }

        private void OnEnable()
        {
            Destroy(gameObject, lifetime);
        }

        private void FixedUpdate()
        {
            body.MovePosition(body.position + (Vector2)transform.up * (speed * Time.fixedDeltaTime));
        }
    }
}
