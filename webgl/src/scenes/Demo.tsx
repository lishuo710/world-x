import {
  Engine,
  EngineOptions,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  Scene,
  SceneOptions,
  Vector3,
  SceneLoader,
  ActionManager,
  ExecuteCodeAction,
  FollowCamera,
  ArcRotateCamera,
  Quaternion,
  FreeCamera,
  CubeTexture,
  StandardMaterial,
  Texture,
  Nullable,
  AnimationGroup,
  Color3,
  Sound,
  PhysicsAggregate,
  PhysicsShapeType,
} from "@babylonjs/core";
import { PhysicsEngine, HavokPlugin } from "@babylonjs/core/Physics";
import React, { FC, useEffect, useRef } from "react";
import HavokPhysics from "@babylonjs/havok";

type OnSceneReadyHandler = (scene: Scene) => void;

type OnRenderHandler = (scene: Scene) => void;

import "@babylonjs/loaders/glTF";

// import SceneComponent from 'babylonjs-hook'; // if you install 'babylonjs-hook' NPM.

import styles from "./Demo.module.css";
import { name } from "@babylonjs/gui";

type SceneComponentProps = {
  canvasId: string;
  antialias?: boolean;
  engineOptions?: EngineOptions;
  adaptToDeviceRatio?: boolean;
  sceneOptions?: SceneOptions;
  onRender: OnRenderHandler;
  onSceneReady: OnSceneReadyHandler;
};

const SceneComponent: FC<SceneComponentProps> = (props) => {
  const reactCanvas = useRef(null);

  const {
    canvasId,
    antialias,
    engineOptions,
    adaptToDeviceRatio,
    sceneOptions,
    onRender,
    onSceneReady,
    ...rest
  } = props;

  useEffect(() => {
    if (!reactCanvas.current) return;
    const engine = new Engine(
      reactCanvas.current,
      antialias,
      engineOptions,
      adaptToDeviceRatio
    );
    const scene = new Scene(engine, sceneOptions);
    if (scene.isReady()) {
      onSceneReady(scene);
    } else {
      scene.onReadyObservable.addOnce(onSceneReady);
    }

    engine.runRenderLoop(() => {
      onRender(scene);
      scene.render();
    });

    const resize = () => {
      scene.getEngine().resize();
    };

    if (window) {
      window.addEventListener("resize", resize);
    }

    return () => {
      scene.getEngine().dispose();

      if (window) {
        window.removeEventListener("resize", resize);
      }
    };
  }, [
    antialias,
    engineOptions,
    adaptToDeviceRatio,
    sceneOptions,
    onRender,
    onSceneReady,
  ]);

  return (
    <canvas
      className={styles.Scene}
      id={canvasId}
      ref={reactCanvas}
      {...rest}
    />
  );
};

let player: Mesh;
let ground: Mesh;
let idle: Nullable<AnimationGroup>;
let walk: Nullable<AnimationGroup>;
let run: Nullable<AnimationGroup>;
let dance: Nullable<AnimationGroup>;
let sad: Nullable<AnimationGroup>;
let win: Nullable<AnimationGroup>;
let pose: Nullable<AnimationGroup>;

const onSceneReady: OnSceneReadyHandler = async (scene) => {
  // This creates and positions a free camera (non-mesh)
  const camera = new FreeCamera("camera1", new Vector3(-5, 15, -15), scene);
  camera.rotationQuaternion = new Quaternion();
  camera.speed = 0.5;

  const canvas = scene.getEngine().getRenderingCanvas();
  // This attaches the camera to the canvas
  camera.attachControl(canvas, true);

  const camera2 = new ArcRotateCamera(
    "camera2",
    0,
    0,
    100,
    new Vector3(0, 0, 0),
    scene
  );

  camera.lockedTarget = player; //babylon 2.5 版本以后

  const envTex = CubeTexture.CreateFromPrefilteredData(
    "/src/assets/environment.env",
    scene
  ); //创建并返回由IBL-Baker或Lys等工具根据预过滤数据创建的纹理。
  scene.environmentTexture = envTex; //创建 环境纹理 （在所有pbr材质中用作反射纹理的纹理。 正如在大多数场景中一样，它们是相同的（多房间等除外）， 这比从所有材料中引用更容易。）
  scene.createDefaultSkybox(envTex, true); //创建新的天空盒

  const music = new Sound(
    "",
    "/src/assets/audio/Masque_Jupiter.mp3",
    scene,
    null,
    {
      loop: true,
      autoplay: true,
    }
  );

  // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

  // Default intensity is 1. Let's dim the light a small amount
  light.intensity = 0.7;

  HavokPhysics().then((havokInstance) => {
    const havokPlugin = new HavokPlugin(true, havokInstance);
    // enable physics in the scene with a gravity
    scene.enablePhysics(new Vector3(0, -9.8, 0), havokPlugin);
  });

  //import gltf
  SceneLoader.ImportMesh(
    "",
    "/src/assets/glb/",
    "Blend_2107.glb",
    scene,
    function (meshes) {
      // Create a static box shape.
      for (let i = 0; i < meshes.length; i++) {
        const groundAggregate = new PhysicsAggregate(
          meshes[i],
          PhysicsShapeType.BOX,
          { mass: 0 },
          scene
        );
      }
    }
  );

  //import glb
  SceneLoader.Append("/src/assets/glb/", "f_1.glb", scene, function (meshes) {
    player = scene.getMeshByName("f_1");
    camera.lockedTarget = player; //babylon 2.5 版本以后
    idle = scene.getAnimationGroupByName("Idle");
    idle.start(true);
    walk = scene.getAnimationGroupByName("Walk");
    run = scene.getAnimationGroupByName("Run");
    dance = scene.getAnimationGroupByName("Dance");
    sad = scene.getAnimationGroupByName("Sad");
    win = scene.getAnimationGroupByName("Win");
    pose = scene.getAnimationGroupByName("A-pose");

    // Create a sphere shape and the associated body. Size will be determined automatically.
    const sphereAggregate = new PhysicsAggregate(
      player,
      PhysicsShapeType.SPHERE,
      { mass: 1, restitution: 0.75 },
      scene
    );
  });

  // Keyboard events
  scene.actionManager = new ActionManager(scene);
  scene.actionManager.registerAction(
    new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, function (evt) {
      inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    })
  );
  scene.actionManager.registerAction(
    new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, function (evt) {
      inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    })
  );
};

const inputMap = {};
/**
 * Will run on every frame render.  We are spinning the player on y-axis.
 */
const onRender: OnRenderHandler = (scene) => {
  let heroRotationSpeed = 0.1;
  let heroSpeed = -0.1;
  let heroSpeedBackwards = 0.1;

  //character control
  let keydown = false;
  //Manage the movements of the character (e.g. position, direction)
  if (inputMap["w"]) {
    player.movePOV(0, 0, heroSpeed);
    run.start(false, 1);
    keydown = true;
  }
  if (inputMap["s"]) {
    player.movePOV(0, 0, heroSpeedBackwards);
    keydown = true;
  }
  if (inputMap["a"]) {
    player.rotate(Vector3.Up(), -heroRotationSpeed);
    keydown = true;
  }
  if (inputMap["d"]) {
    player.rotate(Vector3.Up(), heroRotationSpeed);
    keydown = true;
  }
  if (inputMap["b"]) {
    keydown = true;
  }
};

const Demo: FC = () => (
  <div>
    <SceneComponent
      canvasId="babylon-canvas"
      antialias
      onSceneReady={onSceneReady}
      onRender={onRender}
    />
  </div>
);

export default Demo;
