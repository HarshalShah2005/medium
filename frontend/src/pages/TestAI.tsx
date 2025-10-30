import { Appbar } from "../components/Appbar"
import GeminiAPITest from "../components/GeminiAPITest"

export const TestAI = () => {
    return (
        <div>
            <Appbar />
            <div className="flex justify-center w-full pt-8 px-4">
                <div className="max-w-4xl w-full">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">AI Services Test Page</h1>
                    <GeminiAPITest />
                </div>
            </div>
        </div>
    )
}
