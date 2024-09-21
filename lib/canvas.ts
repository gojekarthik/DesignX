
import { v4 as uuid4 } from "uuid";
import * as fabric from 'fabric';


import {
  CanvasMouseDown,
  CanvasMouseMove,
  CanvasMouseUp,
  CanvasObjectModified,
  CanvasObjectScaling,
  CanvasPathCreated,
  CanvasSelectionCreated,
  RenderCanvas,
} from "@/types/type";
import { defaultNavElement } from "@/constants";
import { createSpecificShape } from "./shapes";

// Initialize fabric canvas
export const initializeFabric = ({
  fabricRef,
  canvasRef,
}: {
  fabricRef: React.MutableRefObject<fabric.Canvas | null>;
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
}) => {
  // get canvas element
  const canvasElement = document.getElementById("canvas");

  // Return early if the canvas element is not found
  if (!canvasElement || !canvasRef.current) {
    console.error("Canvas element or canvasRef is null");
    return null;
  }

  // create fabric canvas
  
  if(fabricRef.current){
    return fabricRef.current
  }

  const canvas = new fabric.Canvas(canvasRef.current,{
    width: canvasElement.clientWidth,
    height: canvasElement.clientHeight
  })
  // const canvas = new fabric.Canvas(canvasRef.current, {
  //   width: canvasElement.clientWidth,
  //   height: canvasElement.clientHeight,
  // });

  // set canvas reference to fabricRef so we can use it later anywhere outside canvas listener
  fabricRef.current = canvas;

  return canvas;
};

// Handle canvas mouse down event
export const handleCanvasMouseDown = ({
  options,
  canvas,
  selectedShapeRef,
  isDrawing,
  shapeRef,
}: CanvasMouseDown) => {
  const pointer = canvas.getPointer(options.e);
  const target = canvas.findTarget(options.e, false);

  canvas.isDrawingMode = false;

  if (selectedShapeRef.current === "freeform") {
    isDrawing.current = true;
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush.width = 5;
    return;
  }

  if (
    target &&
    (target.type === selectedShapeRef.current || target.type === "activeSelection")
  ) {
    isDrawing.current = false;
    canvas.setActiveObject(target);
    target.setCoords();
  } else {
    isDrawing.current = true;
    shapeRef.current = createSpecificShape(selectedShapeRef.current, pointer as any);

    if (shapeRef.current) {
      canvas.add(shapeRef.current);
    }
  }
};

// Handle canvas mouse move event
export const handleCanvaseMouseMove = ({
  options,
  canvas,
  isDrawing,
  selectedShapeRef,
  shapeRef,
  syncShapeInStorage,
}: CanvasMouseMove) => {
  if (!isDrawing.current || selectedShapeRef.current === "freeform") return;

  const pointer = canvas.getPointer(options.e);
  canvas.isDrawingMode = false;

  switch (selectedShapeRef?.current) {
    case "rectangle":
      shapeRef.current?.set({
        width: pointer.x - (shapeRef.current?.left || 0),
        height: pointer.y - (shapeRef.current?.top || 0),
      });
      break;
    case "circle":
      shapeRef.current.set({
        radius: Math.abs(pointer.x - (shapeRef.current?.left || 0)) / 2,
      });
      break;
    case "triangle":
      shapeRef.current?.set({
        width: pointer.x - (shapeRef.current?.left || 0),
        height: pointer.y - (shapeRef.current?.top || 0),
      });
      break;
    case "line":
      shapeRef.current?.set({
        x2: pointer.x,
        y2: pointer.y,
      });
      break;
    case "image":
      shapeRef.current?.set({
        width: pointer.x - (shapeRef.current?.left || 0),
        height: pointer.y - (shapeRef.current?.top || 0),
      });
    default:
      break;
  }

  canvas.renderAll();

  if (shapeRef.current?.objectId) {
    syncShapeInStorage(shapeRef.current);
  }
};

// Handle canvas mouse up event
export const handleCanvasMouseUp = ({
  canvas,
  isDrawing,
  shapeRef,
  activeObjectRef,
  selectedShapeRef,
  syncShapeInStorage,
  setActiveElement,
}: CanvasMouseUp) => {
  isDrawing.current = false;
  if (selectedShapeRef.current === "freeform") return;

  syncShapeInStorage(shapeRef.current);

  shapeRef.current = null;
  activeObjectRef.current = null;
  selectedShapeRef.current = null;

  if (!canvas.isDrawingMode) {
    setTimeout(() => {
      setActiveElement(defaultNavElement);
    }, 700);
  }
};

// Handle object modification
export const handleCanvasObjectModified = ({
  options,
  syncShapeInStorage,
}: CanvasObjectModified) => {
  const target = options.target;
  if (!target) return;

  if (target?.type == "activeSelection") {
    // Handle active selection
  } else {
    syncShapeInStorage(target);
  }
};

// Handle path creation in freeform mode
export const handlePathCreated = ({
  options,
  syncShapeInStorage,
}: CanvasPathCreated) => {
  const path = options.path;
  if (!path) return;

  path.set({ objectId: uuid4() });
  syncShapeInStorage(path);
};

// Restrict object movement within canvas boundaries
export const handleCanvasObjectMoving = ({
  options,
}: {
  options: fabric.IEvent;
}) => {
  const target = options.target as fabric.Object;
  const canvas = target.canvas as fabric.Canvas;

  target.setCoords();

  if (target && target.left) {
    target.left = Math.max(
      0,
      Math.min(
        target.left,
        (canvas.width || 0) - (target.getScaledWidth() || target.width || 0)
      )
    );
  }

  if (target && target.top) {
    target.top = Math.max(
      0,
      Math.min(
        target.top,
        (canvas.height || 0) - (target.getScaledHeight() || target.height || 0)
      )
    );
  }
};

// Handle element selection and set attributes
export const handleCanvasSelectionCreated = ({
  options,
  isEditingRef,
  setElementAttributes,
}: CanvasSelectionCreated) => {
  if (isEditingRef.current || !options?.selected) return;

  const selectedElement = options?.selected[0] as fabric.Object;

  if (selectedElement && options.selected.length === 1) {
    const scaledWidth = selectedElement?.scaleX
      ? selectedElement?.width! * selectedElement?.scaleX
      : selectedElement?.width;

    const scaledHeight = selectedElement?.scaleY
      ? selectedElement?.height! * selectedElement?.scaleY
      : selectedElement?.height;

    setElementAttributes({
      width: scaledWidth?.toFixed(0).toString() || "",
      height: scaledHeight?.toFixed(0).toString() || "",
      fill: selectedElement?.fill?.toString() || "",
      stroke: selectedElement?.stroke || "",
      fontSize: selectedElement?.fontSize || "",
      fontFamily: selectedElement?.fontFamily || "",
      fontWeight: selectedElement?.fontWeight || "",
    });
  }
};

// Update attributes during object scaling
export const handleCanvasObjectScaling = ({
  options,
  setElementAttributes,
}: CanvasObjectScaling) => {
  const selectedElement = options.target;

  const scaledWidth = selectedElement?.scaleX
    ? selectedElement?.width! * selectedElement?.scaleX
    : selectedElement?.width;

  const scaledHeight = selectedElement?.scaleY
    ? selectedElement?.height! * selectedElement?.scaleY
    : selectedElement?.height;

  setElementAttributes((prev) => ({
    ...prev,
    width: scaledWidth?.toFixed(0).toString() || "",
    height: scaledHeight?.toFixed(0).toString() || "",
  }));
};

// Render objects on canvas
export const renderCanvas = ({
  fabricRef,
  canvasObjects,
  activeObjectRef,
}: RenderCanvas) => {
  fabricRef.current?.clear();

  Array.from(canvasObjects, ([objectId, objectData]) => {
    fabric.util.enlivenObjects(
      [objectData],
      (enlivenedObjects: fabric.Object[]) => {
        enlivenedObjects.forEach((enlivenedObj) => {
          if (activeObjectRef.current?.objectId === objectId) {
            fabricRef.current?.setActiveObject(enlivenedObj);
          }
          fabricRef.current?.add(enlivenedObj);
        });
      },
      "fabric"
    );
  });

  fabricRef.current?.renderAll();
};

// Resize canvas on window resize
export const handleResize = ({ canvas }: { canvas: fabric.Canvas | null }) => {
  const canvasElement = document.getElementById("canvas");
  if (!canvasElement || !canvas) return;

  canvas.setDimensions({
    width: canvasElement.clientWidth,
    height: canvasElement.clientHeight,
  });
};

// Handle zooming on mouse scroll
export const handleCanvasZoom = ({
  options,
  canvas,
}: {
  options: fabric.IEvent & { e: WheelEvent };
  canvas: fabric.Canvas;
}) => {
  const delta = options.e?.deltaY;
  let zoom = canvas.getZoom();

  const minZoom = 0.2;
  const maxZoom = 1;
  const zoomStep = 0.001;

  zoom = Math.min(Math.max(minZoom, zoom + delta * zoomStep), maxZoom);

  canvas.zoomToPoint({ x: options.e.offsetX, y: options.e.offsetY }, zoom);

  options.e.preventDefault();
  options.e.stopPropagation();
};
