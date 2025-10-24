export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-4">
          World-Kernel Platform
        </h1>
        <p className="text-lg text-gray-600">
          A collaborative platform for world-building and creative writing
        </p>
        <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-2">Welcome!</h2>
          <p className="text-gray-700">
            The platform is being set up. Soon you'll be able to share, fork, and
            build upon world-kernels with other creative writers.
          </p>
        </div>
      </div>
    </main>
  );
}
