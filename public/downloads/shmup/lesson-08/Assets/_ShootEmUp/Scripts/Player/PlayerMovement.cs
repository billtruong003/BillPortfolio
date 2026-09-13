using UnityEngine;
using UnityEngine.InputSystem;

namespace ShootEmUp.Player
{
    /// <summary>
    /// Reads the Gameplay/Move action and moves the ship with a kinematic Rigidbody2D,
    /// clamped to the area the main camera can see.
    /// </summary>
    [RequireComponent(typeof(Rigidbody2D))]
    public sealed class PlayerMovement : MonoBehaviour
    {
        [Tooltip("Input Actions asset that contains the Gameplay/Move action.")]
        [SerializeField] private InputActionAsset controls;

        [Tooltip("World units per second at full stick / key press.")]
        [SerializeField] private float speed = 8f;

        [Tooltip("Keep this much distance (world units) between the ship pivot and the screen edge.")]
        [SerializeField] private Vector2 edgePadding = new Vector2(1.2f, 1f);

        private Rigidbody2D body;
        private InputAction moveAction;
        private Vector2 moveInput;
        private Vector2 minBounds;
        private Vector2 maxBounds;

        private void Awake()
        {
            body = GetComponent<Rigidbody2D>();
            moveAction = controls.FindAction("Gameplay/Move", throwIfNotFound: true);
            CacheCameraBounds();
        }

        private void OnEnable()
        {
            moveAction.Enable();
        }

        private void OnDisable()
        {
            moveAction.Disable();
        }

        private void Update()
        {
            moveInput = moveAction.ReadValue<Vector2>();
        }

        private void FixedUpdate()
        {
            CacheCameraBounds();
            var target = body.position + moveInput * (speed * Time.fixedDeltaTime);
            target.x = Mathf.Clamp(target.x, minBounds.x, maxBounds.x);
            target.y = Mathf.Clamp(target.y, minBounds.y, maxBounds.y);
            body.MovePosition(target);
        }

        private void CacheCameraBounds()
        {
            var cam = Camera.main;
            var halfHeight = cam.orthographicSize;
            var halfWidth = halfHeight * cam.aspect;
            var center = (Vector2)cam.transform.position;

            minBounds = center - new Vector2(halfWidth, halfHeight) + edgePadding;
            maxBounds = center + new Vector2(halfWidth, halfHeight) - edgePadding;
        }
    }
}
