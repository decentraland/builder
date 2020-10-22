import {
  Vector3,
  WebGLRenderer,
  LoadingManager,
  Mesh,
  Scene,
  Box3,
  OrthographicCamera,
  Geometry,
  BufferGeometry,
  DirectionalLight,
  AmbientLight,
  RectAreaLight,
  MeshStandardMaterial
} from 'three'
import { basename } from 'path'
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { ModelMetrics } from 'modules/scene/types'

// transparent 1x1 pixel
export const TRANSPARENT_PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNiYAAAAAkAAxkR2eQAAAAASUVORK5CYII='

type Options = {
  width: number
  height: number
  mappings?: Record<string, string>
  thumbnailType: '3d' | '2d'
}

const defaults: Options = {
  width: 512,
  height: 512,
  thumbnailType: '3d'
}

export async function getModelData(url: string, options: Partial<Options> = {}) {
  // add defaults to options
  const { width, height, mappings, thumbnailType } = {
    ...defaults,
    ...options
  }

  // setup renderer
  const renderer = new WebGLRenderer({ alpha: true })
  renderer.setSize(width, height, false)
  renderer.domElement.style.visibility = 'hidden'
  document.body.appendChild(renderer.domElement)

  // configure mappings
  let manager
  if (mappings) {
    manager = new LoadingManager()
    manager.setURLModifier(url => {
      const path = basename(new URL(url.replace('blob:', '')).pathname.slice(1))
      const key = Object.keys(mappings).find(key => key.endsWith(path))
      if (key) {
        return mappings[key]
      }

      return url
    })
  }

  try {
    // load model
    let materials = 0
    let bodies = 0
    let colliderTriangles = 0
    const loader = new GLTFLoader(manager)
    const gltf = await new Promise<GLTF>((resolve, reject) => loader.load(url, resolve, undefined, reject))
    gltf.scene.traverse(node => {
      if (node instanceof Mesh) {
        bodies++
        if (node.material) {
          materials++
        }
        if (node.name.includes('_collider')) {
          if (node.geometry instanceof Geometry) {
            colliderTriangles += node.geometry.faces.length
          } else if (node.geometry instanceof BufferGeometry) {
            const geometry = new Geometry().fromBufferGeometry(node.geometry)
            colliderTriangles += geometry.faces.length
          }
          node.visible = false
        } else if (node.material instanceof MeshStandardMaterial && node.material.name.toLowerCase().includes('hair_mat')) {
          node.visible = false
        }
      }
    })
    const root = gltf.scene

    // create scene
    const scene = new Scene()
    scene.add(root)

    // center camera
    let camera: OrthographicCamera
    const size = new Box3()
      .setFromObject(root)
      .getSize(new Vector3())
      .length()
    root.scale.multiplyScalar(1 / size)
    const center = new Box3().setFromObject(root).getCenter(new Vector3())
    if (thumbnailType === '3d') {
      camera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 1000)
      camera.position.set(center.x + 1, center.y + 1, center.z + 1)
    } else {
      camera = new OrthographicCamera(-0.25, 0.25, 0.25, -0.25, 0, 1000)
      camera.position.set(0, 1, 0)
    }
    camera.lookAt(center)
    camera.updateProjectionMatrix()

    // light
    const ambient = new AmbientLight(0xffffff, 1.2)
    scene.add(ambient)

    if (thumbnailType === '3d') {
      const directional = new DirectionalLight(0xffffff, 0.8)
      directional.position.set(1, 1, -1)
      directional.lookAt(center)
      scene.add(directional)
      const rectarea = new RectAreaLight(0xffffff, 0.5, width, height)
      rectarea.position.set(-3, 0, 0)
      rectarea.lookAt(center)
      scene.add(rectarea)
    } else {
      const directional = new DirectionalLight(0xffffff, 1)
      directional.position.set(0, 1, 0)
      directional.lookAt(center)
      scene.add(directional)
    }

    // render scenes
    renderer.render(scene, camera)

    // remove dom element
    document.body.removeChild(renderer.domElement)

    // return data
    const info: ModelMetrics = {
      triangles: renderer.info.render.triangles + colliderTriangles,
      materials,
      textures: renderer.info.memory.textures,
      meshes: renderer.info.memory.geometries,
      bodies,
      entities: 1
    }
    const image = renderer.domElement.toDataURL()

    return { info, image }
  } catch (e) {
    // could not render model, default to 0 metrics and default thumnail
    const info: ModelMetrics = {
      triangles: 0,
      materials: 0,
      textures: 0,
      meshes: 0,
      bodies: 0,
      entities: 1
    }
    const image = TRANSPARENT_PIXEL
    return { info, image }
  }
}
