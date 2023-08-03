import {
  Engine,
  EngineOptions,
  FreeCamera,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  Scene,
  SceneOptions,
  Vector3,
  SceneLoader,
  ActionManager,
  ExecuteCodeAction,
} from "@babylonjs/core";
import React, { FC, useEffect, useRef } from "react";

type OnSceneReadyHandler = (scene: Scene) => void;

type OnRenderHandler = (scene: Scene) => void;

import "@babylonjs/loaders/glTF";

// import SceneComponent from 'babylonjs-hook'; // if you install 'babylonjs-hook' NPM.

import styles from "./Demo.module.css";

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

let box: Mesh;

const onSceneReady: OnSceneReadyHandler = async (scene) => {
  // This creates and positions a free camera (non-mesh)
  const camera = new FreeCamera("camera1", new Vector3(0, 15, -10), scene);

  // This targets the camera to scene origin
  camera.setTarget(Vector3.Zero());

  const canvas = scene.getEngine().getRenderingCanvas();

  // This attaches the camera to the canvas
  camera.attachControl(canvas, true);

  // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

  // Default intensity is 1. Let's dim the light a small amount
  light.intensity = 0.7;

  // Our built-in 'box' shape.
  box = MeshBuilder.CreateBox("box", { size: 2 }, scene);

  // Move the box upward 1/2 its height
  box.position.y = 1;

  // Our built-in 'ground' shape.
  MeshBuilder.CreateGround("ground", { width: 6, height: 6 }, scene);

  //import gltf
  SceneLoader.Append(
    "/src/assets/glTF/",
    "018-watermill.gltf",
    scene,
    function (meshes) {
      console.log(130, meshes);
    }
  );

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
 * Will run on every frame render.  We are spinning the box on y-axis.
 */
const onRender: OnRenderHandler = (scene) => {
  if (box !== undefined) {
    const deltaTimeInMillis = scene.getEngine().getDeltaTime();

    const rpm = 10;
    box.rotation.y += (rpm / 60) * Math.PI * 2 * (deltaTimeInMillis / 1000);
  }

  let heroRotationSpeed = 1;
  let heroSpeed = 1;
  let heroSpeedBackwards = 1;

  //character control
  let keydown = false;
  //Manage the movements of the character (e.g. position, direction)
  if (inputMap["w"]) {
    box.movePOV(0, 0, heroSpeed);
    keydown = true;
  }
  if (inputMap["s"]) {
    box.moveWithCollisions(box.forward.scaleInPlace(-heroSpeedBackwards));
    keydown = true;
  }
  if (inputMap["a"]) {
    box.rotate(Vector3.Up(), -heroRotationSpeed);
    keydown = true;
  }
  if (inputMap["d"]) {
    box.rotate(Vector3.Up(), heroRotationSpeed);
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
