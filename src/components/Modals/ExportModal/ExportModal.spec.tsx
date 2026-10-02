import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Project } from 'modules/project/types'
import ExportModal from './ExportModal'
import { Props } from './ExportModal.types'

jest.mock('decentraland-dapps/dist/containers/Modal', () => {
  const Modal = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
  Modal.Header = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
  Modal.Content = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
  Modal.Actions = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
  return { __esModule: true, default: Modal }
})

const project = { id: 'project-id', title: 'Project' } as Project

function renderExportModal(props: Partial<Props> = {}) {
  const onExport = jest.fn()
  render(
    <ExportModal
      name="ExportModal"
      metadata={{ project }}
      isLoading={false}
      isSDK6={false}
      progress={0}
      total={0}
      onClose={jest.fn() as unknown as Props['onClose']}
      onExport={onExport}
      {...props}
    />
  )
  return { onExport }
}

describe('when the scene is SDK7', () => {
  it('should download without offering the SDK7 conversion', () => {
    const { onExport } = renderExportModal()

    expect(screen.queryByRole('checkbox')).toBeNull()

    userEvent.click(screen.getByRole('button', { name: 'Download scene' }))

    expect(onExport).toHaveBeenCalledWith(project, false)
  })
})

describe('when the scene is SDK6', () => {
  it('should download as SDK6 by default', () => {
    const { onExport } = renderExportModal({ isSDK6: true })

    expect(screen.getByRole('checkbox')).not.toBeChecked()

    userEvent.click(screen.getByRole('button', { name: 'Download scene' }))

    expect(onExport).toHaveBeenCalledWith(project, false)
  })

  it('should download the SDK7 conversion when the checkbox is checked', () => {
    const { onExport } = renderExportModal({ isSDK6: true })

    userEvent.click(screen.getByRole('checkbox'))
    userEvent.click(screen.getByRole('button', { name: 'Download scene' }))

    expect(onExport).toHaveBeenCalledWith(project, true)
  })
})
