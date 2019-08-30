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
  RectAreaLight
} from 'three'
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { SceneMetrics } from 'modules/scene/types'

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
      const path = new URL(url.replace('blob:', '')).pathname.slice(1)
      const key = Object.keys(mappings).find(key => key.endsWith(path))
      if (key) {
        return mappings[key]
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
  let camera: OrthographicCamera
  const size = new Box3()
    .setFromObject(root)
    .getSize(new Vector3())
    .length()
  root.scale.multiplyScalar(1 / size)
  const center = new Box3().setFromObject(root).getCenter(new Vector3())
  if (thumbnailType === '3d') {
    camera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 1000)
    camera.position.set(1, 1, 1)
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
