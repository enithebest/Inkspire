<script>
  export let data;
  let message = '';
  let tab = 'account'; // 'account' | 'uploads' | 'orders'

  function formatDate(d) {
    try {
      return new Date(d).toLocaleString();
    } catch {
      return d;
    }
  }

  function reorder(order) {
    try {
      const raw = localStorage.getItem('cart');
      const cart = raw ? JSON.parse(raw) : [];
      for (const item of order.items || []) {
        cart.push({
          product_id: item.product_id,
          variant_id: item.variant_id,
          name: item.name,
          color: item.color,
          size: item.size,
          price: item.unit_price,
          qty: item.quantity || 1,
          image_url: item.image_url
        });
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      // Update nav badge immediately
      window.dispatchEvent(new Event('storage'));
      alert('Items added to cart');
    } catch (e) {
      console.error(e);
    }
  }
</script>

<section class="relative min-h-screen bg-gradient-to-b from-[#141b33] via-[#10182c] to-[#0c1124] text-white px-6 py-16 overflow-hidden">
  <div class="absolute -top-40 left-1/2 w-[900px] h-[900px] rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-700/20 blur-3xl -translate-x-1/2"></div>

  <div class="relative z-10 max-w-5xl mx-auto">
    <h1 class="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-300 to-purple-400 bg-clip-text text-transparent">
      My Profile
    </h1>

    <!-- Tabs -->
    <div class="flex justify-center gap-3 mb-8">
      <button
        class={`px-4 py-2 rounded-lg text-sm font-medium border ${tab === 'account' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/5 border-white/10 text-gray-200 hover:bg-white/10'}`}
        on:click={() => (tab = 'account')}
        type="button"
      >Account</button>
      <button
        class={`px-4 py-2 rounded-lg text-sm font-medium border ${tab === 'uploads' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/5 border-white/10 text-gray-200 hover:bg-white/10'}`}
        on:click={() => (tab = 'uploads')}
        type="button"
      >Uploads</button>
      <button
        class={`px-4 py-2 rounded-lg text-sm font-medium border ${tab === 'orders' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/5 border-white/10 text-gray-200 hover:bg-white/10'}`}
        on:click={() => (tab = 'orders')}
        type="button"
      >Orders</button>
    </div>

    {#if tab === 'account'}
      <form
        method="POST"
        action="?/update"
        class="max-w-lg mx-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-8 space-y-5"
      >
        <div>
          <label class="block text-sm font-semibold text-gray-300 mb-1">E-Mail</label>
          <input
            type="email"
            name="email"
            value={data.user.email}
            readonly
            class="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-300 mb-1">Full name</label>
          <input
            type="text"
            name="full_name"
            value={data.user.full_name}
            class="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-300 mb-1">New password (optional)</label>
          <input
            type="password"
            name="password"
            class="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
          />
        </div>

        <button
          type="submit"
          class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-lg shadow-blue-500/20 transition-all duration-200"
        >
          Update profile
        </button>

        {#if message}
          <p class="text-center text-green-400 font-medium mt-3">{message}</p>
        {/if}
      </form>
    {:else if tab === 'uploads'}
      <div class="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
        <h2 class="text-xl font-semibold mb-4 text-indigo-300">My Uploads</h2>
        {#if (data.uploads?.length || 0) === 0}
          <p class="text-gray-300">No uploads yet.</p>
        {:else}
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {#each data.uploads as up}
              <div class="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                <img src={up.image_url} alt="Upload" class="w-full h-40 object-cover" />
                <div class="p-3 flex items-center justify-between gap-3">
                  <span class="text-xs text-gray-300">{formatDate(up.created_at)}</span>
                  <form method="POST" action="?/deleteUpload">
                    <input type="hidden" name="id" value={up.id} />
                    <button class="text-red-400 hover:text-red-300 text-sm">Delete</button>
                  </form>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {:else if tab === 'orders'}
      <div class="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
        <h2 class="text-xl font-semibold mb-4 text-indigo-300">My Orders</h2>
        {#if (data.orders?.length || 0) === 0}
          <p class="text-gray-300">No orders yet.</p>
        {:else}
          <div class="space-y-4">
            {#each data.orders as order (order.id)}
              <details class="bg-white/5 border border-white/10 rounded-lg" open={false}>
                <summary class="cursor-pointer list-none px-4 py-3 flex items-center justify-between">
                  <div class="flex flex-col">
                    <span class="text-sm text-gray-300">Order #{order.id}</span>
                    <span class="text-xs text-gray-400">{formatDate(order.created_at)} • {order.status}</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-sm font-semibold text-white">${order.total_price}</span>
                    <button type="button" class="text-sm px-3 py-1 rounded bg-blue-600 hover:bg-blue-500" on:click={() => reorder(order)}>Reorder</button>
                  </div>
                </summary>
                <div class="px-4 pb-4">
                  {#if (order.items?.length || 0) === 0}
                    <p class="text-gray-300 text-sm">No items.</p>
                  {:else}
                    <ul class="divide-y divide-white/10">
                      {#each order.items as it (it.id)}
                        <li class="py-3 flex items-center gap-3">
                          <img src={it.image_url ?? '/placeholder.png'} alt={it.name} class="w-12 h-12 object-cover rounded" />
                          <div class="flex-1">
                            <div class="text-sm text-white">{it.name}</div>
                            <div class="text-xs text-gray-400">{it.color || '-'} / {it.size || '-'} • Qty {it.quantity}</div>
                          </div>
                          <div class="text-sm text-gray-200">${it.unit_price}</div>
                        </li>
                      {/each}
                    </ul>
                  {/if}
                </div>
              </details>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </div>
</section>
  
