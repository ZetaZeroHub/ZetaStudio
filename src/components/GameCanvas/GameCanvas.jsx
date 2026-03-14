import PixiCanvas from './PixiCanvas';
import ThreeCanvas from './ThreeCanvas';
import useEditorStore from '../../stores/editorStore';

export default function GameCanvas({ mode }) {
  const dimension = useEditorStore(s => s.dimension);
  
  if (dimension === '3D') {
    return <ThreeCanvas mode={mode} />;
  }
  
  return <PixiCanvas mode={mode} />;
}
