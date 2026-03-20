import { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Polyfill for react-quill compatibility with React 19
// react-quill needs findDOMNode which was removed from React 18+
if (!(ReactDOM as any).findDOMNode) {
  // Try to use the unstable version if available
  const unstableFindDOMNode = (ReactDOM as any).unstable_findDOMNode;
  if (unstableFindDOMNode) {
    (ReactDOM as any).findDOMNode = unstableFindDOMNode;
  } else {
    // Fallback polyfill for React 19
    (ReactDOM as any).findDOMNode = function findDOMNode(component: any): Element | Text | null {
      if (component == null) return null;
      if (component.nodeType === 1 || component.nodeType === 3) return component;
      
      // Walk the fiber tree to find the DOM node
      let fiber = (component as any)._reactRootContainer?._internalRoot?.current ||
                  (component as any)._reactInternalFiber ||
                  (component as any)._reactIntern;
      
      while (fiber) {
        const stateNode = fiber.stateNode;
        if (stateNode && (stateNode.nodeType === 1 || stateNode.nodeType === 3)) {
          return stateNode;
        }
        fiber = fiber.child;
      }
      
      return null;
    };
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
