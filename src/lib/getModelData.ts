import {
  Vector3,
  WebGLRenderer,
  LoadingManager,
  LoaderUtils,
  Mesh,
  Scene,
  Box3,
  OrthographicCamera,
  Geometry,
  BufferGeometry,
  DirectionalLight,
  AmbientLight
} from 'three'
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { SceneMetrics } from 'modules/scene/types'

type Options = {
  width: number
  height: number
  mappings?: Record<string, string>
}

const defaults: Options = {
  width: 512,
  height: 512
}

export async function getModelData(url: string, options: Partial<Options> = {}) {
  // add defaults to options
  const { width, height, mappings } = {
    ...defaults,
    ...options
  }

  // setup renderer
  const renderer = new WebGLRenderer({ alpha: true })
  renderer.setSize(width, height, false)
  renderer.domElement.style.visibility = 'hidden'
  document.body.prepend(renderer.domElement)

  // configure mappings
  let manager
  if (mappings) {
    manager = new LoadingManager()
    manager.setURLModifier(url => {
      const base = LoaderUtils.extractUrlBase(url)
      const path = url.replace(base, '').replace(/^(\.?\/)/, '')
      if (path in mappings) {
        return mappings[path]
      }

      return url
    })
  }

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
      if (node.name.endsWith('_collider')) {
        if (node.geometry instanceof Geometry) {
          colliderTriangles += node.geometry.faces.length
        } else if (node.geometry instanceof BufferGeometry) {
          const geometry = new Geometry().fromBufferGeometry(node.geometry)
          colliderTriangles += geometry.faces.length
        }
        node.visible = false
      }
    }
  })
  const root = gltf.scene

  // create scene
  const scene = new Scene()
  scene.add(root)

  // center camera
  const size = new Box3()
    .setFromObject(root)
    .getSize(new Vector3())
    .length()
  root.scale.multiplyScalar(1 / size)
  const center = new Box3().setFromObject(root).getCenter(new Vector3())
  const camera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 1000)
  camera.position.set(1, 1, 1)
  camera.lookAt(center)
  camera.updateProjectionMatrix()

  // light
  const ambient = new AmbientLight(0xffffff, 0.75)
  const directional = new DirectionalLight(0xffffff, 3)
  directional.position.set(1, 1, -1)
  directional.lookAt(center)
  scene.add(ambient)
  scene.add(directional)

  // render scenes
  renderer.render(scene, camera)

  // remove dom element
  document.body.removeChild(renderer.domElement)

  // return data
  const info: SceneMetrics = {
    triangles: renderer.info.render.triangles + colliderTriangles,
    materials,
    textures: renderer.info.memory.textures,
    geometries: renderer.info.memory.geometries,
    bodies,
    entities: 1
  }
  const image = renderer.domElement.toDataURL()

  return { info, image }
}
