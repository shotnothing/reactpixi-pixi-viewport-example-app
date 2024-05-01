import React, { forwardRef } from "react";
import type PIXI from "pixi.js";
import { PixiComponent, useApp } from "@pixi/react";
import { Viewport } from "pixi-viewport";
import { EventSystem } from "@pixi/events";

export interface ViewportProps {
  screenWidth?: number;
  screenHeight?: number;
  worldWidth?: number;
  worldHeight?: number;
  viewportPlugins?: ("drag" | "pinch" | "wheel" | "decelerate")[];
  children?: React.ReactNode;
}

export interface PixiViewportComponentProps extends ViewportProps {
  app: PIXI.Application;
}

const PixiViewportComponent = PixiComponent<PixiViewportComponentProps, Viewport>('Viewport', {
  create: ({ app, viewportPlugins, ...viewportProps }) => {
    const events = new EventSystem(app.renderer);
    events.domElement = app.renderer.view as unknown as HTMLElement;

    const viewport = new Viewport({
      ticker: app.ticker,
      events,
      ...viewportProps
    });

    // activate plugins
    (viewportPlugins || []).forEach((plugin) => {
      viewport[plugin]();
    });

    return viewport;
  },
  didMount: () => {
    console.log("viewport mounted");
  },
});

export const PixiViewport = forwardRef<Viewport, ViewportProps>((props, ref) => (
  <PixiViewportComponent ref={ref} app={useApp()} {...props} />
));

