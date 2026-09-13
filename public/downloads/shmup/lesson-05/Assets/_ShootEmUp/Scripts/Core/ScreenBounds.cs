using UnityEngine;

namespace ShootEmUp.Core
{
    /// <summary>
    /// World-space rectangle the main camera can see. Computed on demand so it follows aspect changes.
    /// </summary>
    public static class ScreenBounds
    {
        public static Rect Get(Camera camera = null)
        {
            if (camera == null) camera = Camera.main;

            var halfHeight = camera.orthographicSize;
            var halfWidth = halfHeight * camera.aspect;
            var center = (Vector2)camera.transform.position;
            return new Rect(center.x - halfWidth, center.y - halfHeight, halfWidth * 2f, halfHeight * 2f);
        }
    }
}
