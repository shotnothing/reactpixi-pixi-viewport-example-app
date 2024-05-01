import { useState, useCallback, useRef, forwardRef } from "react";
import { Stage, Container, Sprite, useTick } from "@pixi/react";
import { PixiViewport } from "./Viewport";
import { Viewport } from "pixi-viewport";
import { Sprite as ISprite } from "@pixi/sprite";

const width = 500;
const height = 500;

const stageOptions = {
  antialias: true,
  autoDensity: true,
  backgroundAlpha: 0
};

const areas = {
  'world': [1000, 1000, 2000, 2000],
  'center': [1000, 1000, 400, 400],
  'tl': [100, 100, 200, 200],
  'tr': [1900, 100, 200, 200],
  'bl': [100, 1900, 200, 200],
  'br': [1900, 1900, 200, 200]
};

const useIteration = (incr = 0.1) => {
  const [i, setI] = useState(0);
  
  useTick((delta) => {
    setI(i => i + incr * delta);
  });

  return i;
};

type BunnyProps = {
  x: number;
  y: number;
  scale?: number;
}

// Wiggling bunny
const Bunny = forwardRef<ISprite, BunnyProps>((props, ref) => {
  // abstracted away, see settings>js
  const i = useIteration(0.1);

  return (
    <Sprite
      ref={ref}
      image="https://s3-us-west-2.amazonaws.com/s.cdpn.io/693612/IaUrttj.png"
      anchor={0.5}
      rotation={Math.cos(i) * 0.98}
      scale={props.scale || 1}
      {...props}
    />
  );
});

Bunny.displayName = 'Bunny';

// 4 squared bunnies
// positioned by its name
type BunniesContainerProps = {
  name: keyof typeof areas;
  scale?: number;
}

const BunniesContainer: React.FC<BunniesContainerProps> = ({ name }) => {
  const [x, y] = areas[name];
  
  return (
    <Container x={x} y={y}>
      <Bunny x={-50} y={-50} />
      <Bunny x={50} y={-50} />
      <Bunny x={-50} y={50} />
      <Bunny x={50} y={50} />
    </Container>
  );
}

type BunnyFollowingCircleProps = {
  x: number;
  y: number;
  rad: number;
}

const BunnyFollowingCircle = forwardRef<ISprite, BunnyFollowingCircleProps>(({x, y, rad}, ref) => {
  const i = useIteration(0.02);
  return <Bunny ref={ref} x={x + Math.cos(i) * rad} y={y + Math.sin(i) * rad} scale={6} />
});

// the main app
const App = () => {
  // get the actual viewport instance
  const viewportRef = useRef<Viewport>(null);
  
  // get ref of the bunny to follow
  const followBunny = useRef<ISprite>(null);
  
  // interact with viewport directly
  // move and zoom to specified area
  const focus = useCallback((p: keyof typeof areas) => {
    const viewport = viewportRef.current!;
    const [x, y, width, height] = areas[p];
    
    // pause following
    viewport.plugins.pause('follow');
    
    // and snap to selected
    viewport.snapZoom({ width, height, removeOnComplete: true });
    viewport.snap(x, y, { removeOnComplete: true });
  }, []);
  
  const follow = useCallback(() => {
    const viewport = viewportRef.current!;
    
    viewport.snapZoom({ width: 1000, height: 1000 });
    viewport.follow(followBunny.current!, { speed: 20 });
  }, []);
 
  return (
    <>
      <div className="buttons-group">
        <button onClick={() => focus('world')}>Fit</button>
        <button onClick={() => focus('center')}>Center</button>
        <button onClick={() => focus('tl')}>TL</button>
        <button onClick={() => focus('tr')}>TR</button>
        <button onClick={() => focus('bl')}>BL</button>
        <button onClick={() => focus('br')}>BR</button>
        
        <button onClick={() => follow()}>Follow</button>
      </div>
      
      <Stage width={width} height={height} options={stageOptions}>
        <PixiViewport
          ref={viewportRef}
          screenWidth={width}
          screenHeight={height}
          viewportPlugins={["drag"]}
          worldWidth={2000}
          worldHeight={2000}
        >
          <BunniesContainer name="tl" />
          <BunniesContainer name="tr" />
          <BunniesContainer name="bl" />
          <BunniesContainer name="br" />
          <BunniesContainer name="center" scale={2} />
          
          <BunnyFollowingCircle x={1000} y={1000} rad={500} ref={followBunny} />
        </PixiViewport>
      </Stage>
    </>
  );
};

export default App;
