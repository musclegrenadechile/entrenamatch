import { Component, type ErrorInfo, type ReactNode } from 'react'

export interface TabErrorBoundaryProps {
  tabName: string
  children: ReactNode
}

interface State {
  error: Error | null
  key: number
}

export class TabErrorBoundary extends Component<TabErrorBoundaryProps, State> {
  state: State = { error: null, key: 0 }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn(`[TabErrorBoundary:${this.props.tabName}]`, error, info.componentStack)
  }

  retry = () => this.setState({ error: null, key: this.state.key + 1 })

  render() {
    if (this.state.error) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="text-sm font-bold text-white">Error en {this.props.tabName}</p>
          <p className="text-[11px] text-[#9CA3AF] mt-2 max-w-[260px]">{this.state.error.message}</p>
          <button
            type="button"
            onClick={this.retry}
            className="mt-4 px-5 py-2 rounded-2xl bg-[#FF671F] text-black font-bold text-sm"
          >
            Reintentar
          </button>
        </div>
      )
    }
    return <div key={this.state.key} className="flex-1 flex flex-col min-h-0">{this.props.children}</div>
  }
}
